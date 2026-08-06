import smtplib
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
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"AI Employee OS <{settings.smtp_from}>"
        msg["To"] = f"{to_name} <{to_email}>" if to_name else to_email

        # Plain text version
        text_part = MIMEText(body, "plain")

        # HTML version
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
              <p style="color: #999; font-size: 12px;">
                Sent by AI Employee OS
              </p>
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