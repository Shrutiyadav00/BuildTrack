const nodemailer = require('nodemailer');
const fs = require('fs');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('[emailService] Email env vars not configured — emails will be skipped');
    return null;
  }
  _transporter = nodemailer.createTransport({
    host:   EMAIL_HOST,
    port:   Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth:   { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return _transporter;
}

/**
 * Send a Purchase Order PDF by email.
 * Silently skips (logs warning) if email env is not configured or file is missing.
 */
exports.sendPO = async ({ to, poNumber, pdfPath, subject, builderName }) => {
  const transporter = getTransporter();
  if (!transporter) return; // email not configured — skip silently

  if (!fs.existsSync(pdfPath)) {
    console.warn(`[emailService] PDF not found: ${pdfPath} — skipping email`);
    return;
  }

  const from = process.env.EMAIL_FROM || `"BuildTrack" <${process.env.EMAIL_USER}>`;
  await transporter.sendMail({
    from,
    to,
    subject: subject || `Purchase Order ${poNumber} from ${builderName || 'BuildTrack'}`,
    text: `Please find attached Purchase Order ${poNumber}.\n\nThank you.`,
    html: `<p>Please find attached <strong>Purchase Order ${poNumber}</strong>.</p><p>Thank you.</p>`,
    attachments: [{
      filename: `${poNumber}.pdf`,
      path:     pdfPath,
      contentType: 'application/pdf',
    }],
  });
};
