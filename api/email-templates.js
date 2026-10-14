function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function textValue(value) { return value || 'Not specified'; }

function adminEmail(inquiry) {
  const desired = textValue(inquiry.desired);
  const frequency = textValue(inquiry.frequency);
  return {
    subject: `New Automation Inquiry — ${inquiry.name}`,
    text: ['DeTLeng Automation — New Automation Desk Inquiry','',`Reference: ${inquiry.reference}`,`Name: ${inquiry.name}`,`Email: ${inquiry.email}`,'','WHAT ARE THEY DOING MANUALLY?',inquiry.manual,'','WHAT SHOULD HAPPEN INSTEAD?',desired,'','HOW OFTEN DOES THIS HAPPEN?',frequency,'',`Submitted: ${inquiry.submittedAt}`,`Source: ${inquiry.source}`].join('\n'),
    html: `<!doctype html><html><body style="margin:0;background:#f5f1e8;color:#111827;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:32px 18px"><div style="background:#142039;color:#fff;border-radius:20px;padding:26px"><div style="color:#7bf0d0;font-size:12px;font-weight:700;letter-spacing:.12em">DETLENG AUTOMATION · AUTOMATION DESK</div><h1 style="margin:12px 0 0;font-size:28px">New automation inquiry</h1></div><div style="background:#fff;border:1px solid #ded8cb;border-radius:20px;padding:26px;margin-top:14px"><p><strong>Reference:</strong> ${escapeHtml(inquiry.reference)}<br><strong>Name:</strong> ${escapeHtml(inquiry.name)}<br><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p><hr style="border:0;border-top:1px solid #e7e2d8;margin:22px 0"><p style="font-size:12px;font-weight:700;letter-spacing:.08em">WHAT ARE THEY DOING MANUALLY?</p><p style="white-space:pre-wrap">${escapeHtml(inquiry.manual)}</p><p style="font-size:12px;font-weight:700;letter-spacing:.08em;margin-top:24px">WHAT SHOULD HAPPEN INSTEAD?</p><p style="white-space:pre-wrap">${escapeHtml(desired)}</p><p style="font-size:12px;font-weight:700;letter-spacing:.08em;margin-top:24px">HOW OFTEN?</p><p>${escapeHtml(frequency)}</p><hr style="border:0;border-top:1px solid #e7e2d8;margin:22px 0"><p style="color:#667085;font-size:12px">Submitted ${escapeHtml(inquiry.submittedAt)} from ${escapeHtml(inquiry.source)}</p></div></div></body></html>`
  };
}

function acknowledgementEmail(inquiry) {
  const firstName = inquiry.name.split(/\s+/)[0];
  return {
    subject: `We’ve received your automation brief — ${inquiry.reference}`,
    text: [`Hello ${firstName},`,'','Thank you for sharing the manual work you would like to improve.','Your automation brief has been received by the DeTLeng Automation Desk. We will review the current process and consider the most practical next step.','',`Reference: ${inquiry.reference}`,'','YOUR CURRENT MANUAL WORK',inquiry.manual,'','This message confirms receipt; it is not yet a technical recommendation or project commitment.','','DeTLeng Automation','Understand the work first. Technology second.'].join('\n'),
    html: `<!doctype html><html><body style="margin:0;background:#f5f1e8;color:#111827;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:32px 18px"><div style="background:linear-gradient(135deg,#142039,#135c59);color:#fff;border-radius:22px;padding:30px"><div style="color:#7bf0d0;font-size:12px;font-weight:700;letter-spacing:.12em">DETLENG AUTOMATION · AUTOMATION DESK</div><h1 style="margin:14px 0 8px;font-size:30px">We’ve received your brief.</h1><p style="margin:0;color:#d9f7ee">Reference ${escapeHtml(inquiry.reference)}</p></div><div style="background:#fff;border:1px solid #ded8cb;border-radius:20px;padding:28px;margin-top:14px"><p>Hello ${escapeHtml(firstName)},</p><p>Thank you for sharing the manual work you would like to improve. Your automation brief has been received by the DeTLeng Automation Desk.</p><p>We’ll review the current process and consider the most practical next step.</p><div style="background:#f5f1e8;border-left:4px solid #2f7765;border-radius:12px;padding:18px;margin:24px 0"><div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#2f7765">YOUR CURRENT MANUAL WORK</div><p style="white-space:pre-wrap;margin-bottom:0">${escapeHtml(inquiry.manual)}</p></div><p style="color:#667085;font-size:13px">This message confirms receipt; it is not yet a technical recommendation or project commitment.</p><p style="margin-top:28px"><strong>DeTLeng Automation</strong><br><span style="color:#667085">Understand the work first. Technology second.</span></p></div></div></body></html>`
  };
}

module.exports = { escapeHtml, adminEmail, acknowledgementEmail };
