const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInquiry, makeReference } = require('./server');
const { escapeHtml, acknowledgementEmail } = require('./email-templates');

test('validates a complete inquiry', () => {
  const { inquiry, errors } = validateInquiry({submissionId:'12345678-abcd-4321-abcd-123456789abc',name:'Muhammad Naveed Ishaque',email:'NAVEED@example.com',manual:'I prepare the same spreadsheet report every morning.',desired:'Create and email the report automatically.',frequency:'Every weekday',startedAt:Date.now()-5000,source:'https://automation.detleng.com/#desk'});
  assert.deepEqual(errors, []); assert.equal(inquiry.email, 'naveed@example.com');
});

test('rejects missing required information', () => {
  const { errors } = validateInquiry({ submissionId:'short', name:'', email:'bad', manual:'tiny' });
  assert.ok(errors.length >= 4);
});

test('escapes visitor content in HTML templates', () => {
  assert.equal(escapeHtml('<script>"x"</script>'), '&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
  const email = acknowledgementEmail({ name:'<Naveed>', reference:'DA-TEST', manual:'<b>unsafe</b>' });
  assert.doesNotMatch(email.html, /<b>unsafe<\/b>/);
});

test('creates readable unique references', () => {
  const first = makeReference(), second = makeReference();
  assert.match(first, /^DA-\d{8}-[A-F0-9]{6}$/); assert.notEqual(first, second);
});

test('submits visitor acknowledgement and admin inquiry in one Resend batch', async () => {
  const {submitInquiry} = require('./server');
  const previousFetch = global.fetch;
  const previousApiKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.INQUIRY_FROM_EMAIL;
  const previousAdmin = process.env.INQUIRY_ADMIN_EMAIL;
  const previousReplyTo = process.env.INQUIRY_REPLY_TO_EMAIL;
  const calls = [];
  try {
    process.env.RESEND_API_KEY = 're_mock_test_value';
    process.env.INQUIRY_FROM_EMAIL = 'DeTLeng Automation <notifications@mail.detleng.com>';
    process.env.INQUIRY_ADMIN_EMAIL = 'info@detleng.com';
    process.env.INQUIRY_REPLY_TO_EMAIL = 'info@detleng.com';
    global.fetch = async (url, options) => {
      calls.push({url, options});
      return new Response(JSON.stringify({data:[{id:'ack-123'},{id:'admin-456'}]}), {
        status:200,headers:{'Content-Type':'application/json'}
      });
    };
    const result = await submitInquiry({
      submissionId:'12345678-abcd-4321-abcd-123456789abc',
      name:'Example Student', email:'student@example.com',
      manual:'I create my reports manually every week.', desired:'Automate reports.',
      frequency:'Weekly',source:'https://automation.detleng.com/#desk'
    });
    assert.equal(calls.length, 1, 'one API call rather than two calls');
    assert.equal(calls[0].url, 'https://api.resend.com/emails/batch');
    assert.match(calls[0].options.headers['Idempotency-Key'], /-inquiry-batch$/);
    const messages = JSON.parse(calls[0].options.body);
    assert.equal(messages.length, 2);
    assert.deepEqual(messages[0].to, ['student@example.com']);
    assert.equal(messages[0].reply_to, 'info@detleng.com');
    assert.match(messages[0].html, /network\.detleng\.com/);
    assert.deepEqual(messages[1].to, ['info@detleng.com']);
    assert.equal(messages[1].reply_to, 'student@example.com');
    assert.equal(result.acknowledgementEmailId, 'ack-123');
    assert.equal(result.adminEmailId, 'admin-456');
  } finally {
    global.fetch = previousFetch;
    for (const [key, value] of Object.entries({
      RESEND_API_KEY:previousApiKey,
      INQUIRY_FROM_EMAIL:previousFrom,
      INQUIRY_ADMIN_EMAIL:previousAdmin,
      INQUIRY_REPLY_TO_EMAIL:previousReplyTo
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('retries rate-limited batch using the same idempotency key', async () => {
  const {submitInquiry} = require('./server');
  const previousFetch = global.fetch;
  const previousApiKey = process.env.RESEND_API_KEY;
  const calls = [];
  try {
    process.env.RESEND_API_KEY = 're_mock_test_value';
    global.fetch = async (_, options) => {
      calls.push(options);
      if (calls.length === 1) return new Response(JSON.stringify({message:'Too many requests'}), {status:429,headers:{'Content-Type':'application/json'}});
      return new Response(JSON.stringify({data:[{id:'ack-retry'},{id:'admin-retry'}]}), {status:200,headers:{'Content-Type':'application/json'}});
    };
    const result = await submitInquiry({submissionId:'12345678-abcd-4321-abcd-123456789abc',name:'Test',email:'test@example.com',manual:'Repeat weekly reporting work.'});
    assert.equal(calls.length, 2);
    assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
    assert.equal(calls[0].body, calls[1].body);
    assert.equal(result.acknowledgementEmailId, 'ack-retry');
  } finally {
    global.fetch = previousFetch;
    if (previousApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousApiKey;
  }
});
