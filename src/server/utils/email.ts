import nodemailer from "nodemailer";

function buildInviteHtml(inviterName: string, toRole: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TaskPulse Invitation</title>
</head>
<body style="margin:0;padding:0;background:#0F1117;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1A1D2E;border-radius:16px;border:1px solid rgba(99,102,241,0.2);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366F1,#8B5CF6);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">⚡ TaskPulse</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Project Management, Reimagined</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#F1F5F9;">You're invited! 🎉</h2>
              <p style="margin:0 0 24px;color:#94A3B8;font-size:15px;line-height:1.6;">
                <strong style="color:#F1F5F9;">${inviterName}</strong> has invited you to join
                <strong style="color:#6366F1;">TaskPulse</strong> as a
                <strong style="color:#F1F5F9;">${toRole}</strong>.
              </p>
              <p style="margin:0 0 32px;color:#94A3B8;font-size:15px;line-height:1.6;">
                TaskPulse is a modern project management platform with real-time collaboration,
                AI-powered insights, and a beautiful interface that helps teams ship faster.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="border-radius:12px;padding:1px;background:linear-gradient(135deg,#6366F1,#8B5CF6);">
                    <a href="${appUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:11px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                      Accept Invitation &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">
                Or copy and paste this link:<br/>
                <a href="${appUrl}" style="color:#6366F1;word-break:break-all;">${appUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                If you didn't expect this invitation, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} TaskPulse. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Send an invite email via SMTP.
 */
export async function sendInviteEmail({
  toEmail,
  toRole,
  inviterName,
  appUrl,
}: {
  toEmail: string;
  toRole: string;
  inviterName: string;
  appUrl: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`\n[INVITE EMAIL - No SMTP configured]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: You're invited to join TaskPulse as a ${toRole}`);
    console.log(`App URL: ${appUrl}\n`);
    throw new Error("SMTP not configured");
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const fromEmail = process.env.FROM_EMAIL || smtpUser;
  const info = await transporter.sendMail({
    from: `"TaskPulse" <${fromEmail}>`,
    to: toEmail,
    subject: `You're invited to join TaskPulse as a ${toRole}`,
    html: buildInviteHtml(inviterName, toRole, appUrl),
  });

  console.log(`[Email] ✅ Invite sent to ${toEmail} via SMTP — MessageId: ${info.messageId}`);
  return info;
}
