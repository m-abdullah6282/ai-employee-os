import smtplib
import resend
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


def parse_recipients(value) -> list:
    """Accept a single email, comma/`and` separated string, or a list."""
    if isinstance(value, (list, tuple)):
        emails = []
        for item in value:
            emails.extend(parse_recipients(str(item)))
        return emails
    if isinstance(value, str):
        emails = []
        for candidate in re.split(r"[,;]|\band\b|\+", value):
            found = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", candidate)
            emails.extend(found)
        return emails
    return []


def send_email(
    to_email,
    subject: str,
    body: str,
    to_name: str = "",
) -> dict:
    try:
        to_list = parse_recipients(to_email)
        if not to_list:
            return {"success": False, "error": "No valid recipient email address provided"}

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
                "to": to_list,
                "subject": subject,
                "text": body,
                "html": html_body,
            }
            resend.Emails.send(params)
            return {"success": True, "message": f"Email sent to {', '.join(to_list)}"}

        # ── Mailtrap API (real emails with token) ───────────────
        if settings.mailtrap_api_token:
            import mailtrap as mt
            mail = mt.Mail(
                sender=mt.Address(
                    email="hello@demomailtrap.com",
                    name="AI Employee OS"
                ),
                to=[
                    mt.Address(email=e, name=to_name or e)
                    for e in to_list
                ],
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
            return {"success": True, "message": f"Email sent to {', '.join(to_list)}"}

        # ── SMTP Sandbox (Mailtrap testing fallback) ─────────────
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"AI Employee OS <{settings.smtp_from}>"
        msg["To"] = ", ".join(f"{to_name} <{e}>" if to_name else e for e in to_list)

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
            server.sendmail(settings.smtp_from, to_list, msg.as_string())

        return {"success": True, "message": f"Email sent to {', '.join(to_list)}"}

    except Exception as e:
        return {"success": False, "error": str(e)}