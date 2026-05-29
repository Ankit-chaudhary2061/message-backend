import nodemailer from "nodemailer";

interface IMailOption {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (mailOption: IMailOption) => {
  try {
    const mailOptions: any = {
      from: `"Auth System" <${process.env.SMTP_USER}>`,
      to: mailOption.to,
      subject: mailOption.subject,
      html: mailOption.html,
    };

    if (mailOption.cc) {
      mailOptions.cc = mailOption.cc;
    }

    if (mailOption.bcc) {
      mailOptions.bcc = mailOption.bcc;
    }

    if (mailOption.attachments) {
      mailOptions.attachments = mailOption.attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email not sent");
  }
};

export const otpVerificationHtml = (
  userEmail: string,
  otp: string
) => {
  const html = `
  <div style="margin:0; padding:0; background-color:#f4f6fb; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">

          <table
            cellpadding="0"
            cellspacing="0"
            width="500"
            style="
              width:100%;
              max-width:500px;
              background:#ffffff;
              border-radius:12px;
              padding:30px;
              box-shadow:0 5px 15px rgba(0,0,0,0.08);
            "
          >

            <tr>
              <td align="center">
                <h1 style="margin:0; color:#1f2937;">
                  🔐 Email Verification
                </h1>

                <p style="color:#4b5563; font-size:15px; margin-top:10px;">
                  Hello ${userEmail},
                </p>

                <p style="color:#6b7280; font-size:14px; line-height:22px;">
                  Use the OTP below to verify your account.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center">

                <div
                  style="
                    font-size:32px;
                    font-weight:700;
                    letter-spacing:6px;
                    color:#2563eb;
                    background:#eef2ff;
                    padding:15px 25px;
                    border-radius:10px;
                    display:inline-block;
                    margin:20px 0;
                  "
                >
                  ${otp}
                </div>

              </td>
            </tr>

            <tr>
              <td align="center">

                <p style="color:#6b7280; font-size:14px; margin:0;">
                  This OTP is valid for <b>5 minutes</b>.
                </p>

                <p style="color:#9ca3af; font-size:13px; margin:10px 0 0;">
                  If you did not request this, please ignore this email.
                </p>

              </td>
            </tr>

            <tr>
              <td>
                <hr
                  style="
                    border:none;
                    border-top:1px solid #e5e7eb;
                    margin:25px 0;
                  "
                />
              </td>
            </tr>

            <tr>
              <td align="center">
                <p style="font-size:12px; color:#9ca3af; margin:0;">
                  © 2026 Auth System · All rights reserved
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `;

  return html;
};
