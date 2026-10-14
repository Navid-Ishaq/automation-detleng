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
