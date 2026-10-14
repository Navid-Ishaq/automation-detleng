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
  const desired = textValue(inquiry.desired);
  const frequency = textValue(inquiry.frequency);
  return {
    subject: `We’ve received your automation brief — ${inquiry.reference}`,
    text: [
      `Dear ${inquiry.name},`,'',
      'Thank you for contacting DeTLeng Automation!','',
      'We are pleased that you have shared your automation requirements with us. We have successfully received your inquiry.','',
      `Reference: ${inquiry.reference}`,'',
      'YOUR SUBMITTED REQUIREMENTS','',
      'Current Manual Work:',inquiry.manual,'',
      'What You Would Like to Automate:',desired,'',
      'How Often This Happens:',frequency,'',
      'We will review your requirements and get back to you as soon as possible.','',
      'MEANWHILE, ENJOY OUR DETLENG ECOSYSTEM','',
      'DeTLeng Network — One Ecosystem, Different Doors','https://network.detleng.com/','',
      'LFDS — Logic First Digital Solutions','https://lfds.detleng.com/','',
      'Explore Our Free Tools','Business Flow — https://businessflow.detleng.com/','QR Studio — https://qr.detleng.com/','CSV Cleaner — https://csv.detleng.com/','',
      'Thank you once again for reaching out to us. We look forward to helping you simplify your daily work.','',
      'Warm regards,','DeTLeng Automation','Email: info@detleng.com','Website: https://automation.detleng.com/'
    ].join('\n'),
    html: `<!doctype html><html><body style="margin:0;background:#f5f1e8;color:#111827;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:32px 18px"><div style="background:linear-gradient(135deg,#142039,#135c59);color:#fff;border-radius:22px;padding:30px"><div style="color:#7bf0d0;font-size:12px;font-weight:700;letter-spacing:.12em">DETLENG AUTOMATION · AUTOMATION DESK</div><h1 style="margin:14px 0 8px;font-size:30px">We’ve received your automation brief.</h1><p style="margin:0;color:#d9f7ee">Reference ${escapeHtml(inquiry.reference)}</p></div><div style="background:#fff;border:1px solid #ded8cb;border-radius:20px;padding:28px;margin-top:14px"><p>Dear ${escapeHtml(inquiry.name)},</p><p>Thank you for contacting <strong>DeTLeng Automation!</strong></p><p>We are pleased that you have shared your automation requirements with us. We have successfully received your inquiry.</p><h2 style="font-size:20px;margin:28px 0 14px">Your Submitted Requirements</h2><div style="background:#f5f1e8;border-left:4px solid #2f7765;border-radius:12px;padding:20px"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:#2f7765">CURRENT MANUAL WORK</div><p style="white-space:pre-wrap;margin-top:8px">${escapeHtml(inquiry.manual)}</p><div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:#2f7765;margin-top:20px">WHAT YOU WOULD LIKE TO AUTOMATE</div><p style="white-space:pre-wrap;margin-top:8px">${escapeHtml(desired)}</p><div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:#2f7765;margin-top:20px">HOW OFTEN THIS HAPPENS</div><p style="margin:8px 0 0">${escapeHtml(frequency)}</p></div><p style="margin-top:24px">We will review your requirements and get back to you as soon as possible.</p><div style="background:#142039;color:#fff;border-radius:18px;padding:24px;margin-top:28px"><div style="color:#d9ff72;font-size:11px;font-weight:700;letter-spacing:.1em">MEANWHILE, ENJOY OUR DETLENG ECOSYSTEM</div><h2 style="font-size:22px;margin:10px 0">One ecosystem. Different doors.</h2><p style="color:#dce5e2;margin-bottom:18px">While you are waiting for our response, explore our digital projects, free tools and learning resources.</p><p><a href="https://network.detleng.com/" style="color:#7bf0d0;font-weight:700">DeTLeng Network</a><br><span style="color:#bbc8c5">Explore our websites and digital tools in one place.</span></p><p><a href="https://lfds.detleng.com/" style="color:#7bf0d0;font-weight:700">LFDS — Logic First Digital Solutions</a><br><span style="color:#bbc8c5">See how we approach problems and practical digital solutions.</span></p></div><h2 style="font-size:20px;margin:28px 0 14px">Explore Our Free Tools</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:10px 0;border-bottom:1px solid #e7e2d8"><a href="https://businessflow.detleng.com/" style="color:#216e5d;font-weight:700">Business Flow</a><br><span style="color:#667085">Excel reporting and business analysis</span></td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e7e2d8"><a href="https://qr.detleng.com/" style="color:#216e5d;font-weight:700">QR Studio</a><br><span style="color:#667085">Create free QR codes</span></td></tr><tr><td style="padding:10px 0"><a href="https://csv.detleng.com/" style="color:#216e5d;font-weight:700">CSV Cleaner</a><br><span style="color:#667085">Clean and organize CSV data</span></td></tr></table><p style="margin-top:28px">Thank you once again for reaching out to us. We look forward to helping you simplify your daily work.</p><p style="margin-top:26px">Warm regards,<br><strong>DeTLeng Automation</strong><br><a href="mailto:info@detleng.com" style="color:#216e5d">info@detleng.com</a><br><a href="https://automation.detleng.com/" style="color:#216e5d">automation.detleng.com</a></p></div></div></body></html>`
  };
}

module.exports = { escapeHtml, adminEmail, acknowledgementEmail };
