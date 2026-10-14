const http = require('node:http');
const crypto = require('node:crypto');
const { adminEmail, acknowledgementEmail } = require('./email-templates');

const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_BYTES = 32 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const allowedOrigins = new Set((process.env.FRONTEND_ORIGIN || 'https://automation.detleng.com').split(',').map(value => value.trim()).filter(Boolean));
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:8000');
  allowedOrigins.add('http://127.0.0.1:8000');
}

const rateBuckets = new Map();
const acceptedSubmissions = new Map();

function json(res, status, payload, origin) {
  const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  if (origin && allowedOrigins.has(origin)) { headers['Access-Control-Allow-Origin'] = origin; headers.Vary = 'Origin'; }
  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

function clientIp(req) { return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim(); }

function isRateLimited(ip, now = Date.now()) {
  const active = (rateBuckets.get(ip) || []).filter(timestamp => now - timestamp < RATE_WINDOW_MS);
  if (active.length >= RATE_LIMIT) { rateBuckets.set(ip, active); return true; }
  active.push(now); rateBuckets.set(ip, active); return false;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) { reject(Object.assign(new Error('Request too large'), { status: 413 })); req.destroy(); }
    });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}

function clean(value, maxLength) { return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''; }

function validateInquiry(body) {
  const inquiry = {
    submissionId: clean(body.submissionId, 100), name: clean(body.name, 120), email: clean(body.email, 254).toLowerCase(),
    manual: clean(body.manual, 4000), desired: clean(body.desired, 3000), frequency: clean(body.frequency, 300),
    website: clean(body.website, 200), startedAt: Number(body.startedAt || 0), source: clean(body.source, 500)
  };
  const errors = [];
  if (!inquiry.submissionId || !/^[a-zA-Z0-9-]{8,100}$/.test(inquiry.submissionId)) errors.push('Invalid submission reference.');
  if (inquiry.name.length < 2) errors.push('Please provide your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) errors.push('Please provide a valid email address.');
  if (inquiry.manual.length < 10) errors.push('Please describe the manual work in a little more detail.');
  if (inquiry.startedAt && Date.now() - inquiry.startedAt < 1500) errors.push('Please review the form before submitting.');
  return { inquiry, errors };
}

function makeReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `DA-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function sendEmail(message, idempotencyKey) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  const response = await fetch('https://api.resend.com/emails', {method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(message)});
  const result = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(result.message || `Resend rejected the email (${response.status})`); error.status = response.status; throw error; }
  return result;
}

async function submitInquiry(inquiry) {
  const reference = makeReference();
  const complete = { ...inquiry, reference, submittedAt: new Date().toISOString() };
  const from = process.env.INQUIRY_FROM_EMAIL || 'DeTLeng Automation <notifications@mail.detleng.com>';
  const adminAddress = process.env.INQUIRY_ADMIN_EMAIL || 'info@detleng.com';
  const replyTo = process.env.INQUIRY_REPLY_TO_EMAIL || adminAddress;
  const admin = adminEmail(complete);
  const acknowledgement = acknowledgementEmail(complete);
  const adminResult = await sendEmail({from,to:[adminAddress],reply_to:inquiry.email,subject:admin.subject,text:admin.text,html:admin.html}, `${inquiry.submissionId}-admin`);
  const acknowledgementResult = await sendEmail({from,to:[inquiry.email],reply_to:replyTo,subject:acknowledgement.subject,text:acknowledgement.text,html:acknowledgement.html}, `${inquiry.submissionId}-ack`);
  return { reference, adminEmailId: adminResult.id, acknowledgementEmailId: acknowledgementResult.id };
}

async function handler(req, res) {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    if (!origin || !allowedOrigins.has(origin)) return json(res, 403, { ok:false, message:'Origin not allowed.' });
    res.writeHead(204, {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400',Vary:'Origin'}); return res.end();
  }
  if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok:true, service:'automation-detleng-api' }, origin);
  if (req.method !== 'POST' || req.url !== '/api/inquiries') return json(res, 404, { ok:false, message:'Not found.' }, origin);
  if (!origin || !allowedOrigins.has(origin)) return json(res, 403, { ok:false, message:'Origin not allowed.' });
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return json(res, 415, { ok:false, message:'Content-Type must be application/json.' }, origin);
  if (isRateLimited(clientIp(req))) return json(res, 429, { ok:false, message:'Too many attempts. Please wait and try again.' }, origin);
  try {
    const body = await readJson(req);
    const { inquiry, errors } = validateInquiry(body);
    if (inquiry.website) return json(res, 200, { ok:true, reference:'RECEIVED' }, origin);
    if (errors.length) return json(res, 422, { ok:false, message:errors[0], errors }, origin);
    const existing = acceptedSubmissions.get(inquiry.submissionId);
    if (existing) return json(res, 200, { ok:true, reference:existing.reference, duplicate:true }, origin);
    const result = await submitInquiry(inquiry);
    acceptedSubmissions.set(inquiry.submissionId, { reference:result.reference, acceptedAt:Date.now() });
    console.log(JSON.stringify({ event:'inquiry.accepted', reference:result.reference, adminEmailId:result.adminEmailId, acknowledgementEmailId:result.acknowledgementEmailId }));
    return json(res, 201, { ok:true, reference:result.reference }, origin);
  } catch (error) {
    console.error(JSON.stringify({ event:'inquiry.failed', message:error.message, status:error.status || 500 }));
    return json(res, error.status && error.status < 500 ? error.status : 502, { ok:false, message:'We could not submit your brief right now. Please try again.' }, origin);
  }
}

function pruneMemory() {
  const now = Date.now();
  for (const [key, timestamps] of rateBuckets) { const active = timestamps.filter(timestamp => now - timestamp < RATE_WINDOW_MS); if (active.length) rateBuckets.set(key, active); else rateBuckets.delete(key); }
  for (const [key, value] of acceptedSubmissions) if (now - value.acceptedAt > 24 * 60 * 60 * 1000) acceptedSubmissions.delete(key);
}
const pruneTimer = setInterval(pruneMemory, 30 * 60 * 1000); pruneTimer.unref();

if (require.main === module) http.createServer(handler).listen(PORT, '0.0.0.0', () => console.log(`automation-detleng-api listening on port ${PORT}`));

module.exports = { handler, validateInquiry, isRateLimited, makeReference };
