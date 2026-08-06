import smtplib
import resend
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


def send_email(
    to_email: str,
    subject: str,
    body: str,
    to_name: str = "",
) -> dict:
    try:
        # ── Resend API (real emails, no domain needed) ──────────
        if settings.resend_api_key:
            resend.api_key = settings.resend_api_key
            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                  <h2 style="color: #333;">AI Employee OS 🤖</h2>
                  <hr style="border: 1px solid #dee2e6;">
                  <div style="margin-top: 20px; color: #555; line-height: 1.6;">
                    {body.replace(chr(10), '<br>')}
                  </div>
                  <hr style="border: 1px solid #dee2e6; margin-top: 20px;">
                  <p style="color: #999; font-size: 12px;">Sent by AI Employee OS</p>
                </div>
              </body>
            </html>
            """
            params = {
                "from": "AI Employee OS <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "text": body,
                "html": html_body,
            }
            resend.Emails.send(params)
            return {"success": True, "message": f"Email sent to {to_email}"}

        # ── Mailtrap API (real emails with token) ───────────────
        if settings.mailtrap_api_token:
            import mailtrap as mt
            mail = mt.Mail(
                sender=mt.Address(
                    email="hello@demomailtrap.com",
                    name="AI Employee OS"
                ),
                to=[mt.Address(
                    email=to_email,
                    name=to_name or to_email
                )],
                subject=subject,
                text=body,
                html=f"""
                <html>
                  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                      <h2 style="color: #333;">AI Employee OS 🤖</h2>
                      <hr style="border: 1px solid #dee2e6;">
                      <div style="margin-top: 20px; color: #555; line-height: 1.6;">
                        {body.replace(chr(10), '<br>')}
                      </div>
                      <p style="color: #999; font-size: 12px;">Sent by AI Employee OS</p>
                    </div>
                  </body>
                </html>
                """,
            )
            client = mt.MailtrapClient(token=settings.mailtrap_api_token)
            client.send(mail)
            return {"success": True, "message": f"Email sent to {to_email}"}

        # ── SMTP Sandbox (Mailtrap testing fallback) ─────────────
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"AI Employee OS <{settings.smtp_from}>"
        msg["To"] = f"{to_name} <{to_email}>" if to_name else to_email

        text_part = MIMEText(body, "plain")
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333;">AI Employee OS</h2>
              <hr style="border: 1px solid #dee2e6;">
              <div style="margin-top: 20px; color: #555; line-height: 1.6;">
                {body.replace(chr(10), '<br>')}
              </div>
              <hr style="border: 1px solid #dee2e6; margin-top: 20px;">
              <p style="color: #999; font-size: 12px;">Sent by AI Employee OS</p>
            </div>
          </body>
        </html>
        """
        html_part = MIMEText(html_body, "html")
        msg.attach(text_part)
        msg.attach(html_part)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, to_email, msg.as_string())

        return {"success": True, "message": f"Email sent to {to_email}"}

    except Exception as e:
        return {"success": False, "error": str(e)}