from langchain_core.messages import AIMessage, SystemMessage
from app.agents.state import AgentState
from app.agents.supervisor import get_llm
from app.integrations.gmail import send_email
import re

EMAIL_PROMPT = """You are an AI Email Assistant for a business.

When user wants to send an email, extract:
- recipient email (if provided)
- subject
- email body

Then draft a professional email.

If user provides recipient email, respond in this EXACT format:
SEND_EMAIL
TO: recipient@email.com
SUBJECT: Email subject here
BODY:
Email body here...
END_EMAIL

If no email address provided, just draft the email as normal text.
"""


def email_node(state: AgentState) -> AgentState:
    llm = get_llm()
    messages = [SystemMessage(content=EMAIL_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    content = response.content

    # Check if AI wants to send a real email
    if "SEND_EMAIL" in content:
        try:
            # Parse email details
            to_match = re.search(r"TO:\s*(.+)", content)
            subject_match = re.search(r"SUBJECT:\s*(.+)", content)
            body_match = re.search(r"BODY:\n(.*?)END_EMAIL", content, re.DOTALL)

            if to_match and subject_match and body_match:
                to_email = to_match.group(1).strip()
                subject = subject_match.group(1).strip()
                body = body_match.group(1).strip()

                # Send real email
                result = send_email(
                    to_email=to_email,
                    subject=subject,
                    body=body,
                )

                if result["success"]:
                    final_response = f"""✅ Email sent successfully!

**To:** {to_email}
**Subject:** {subject}

**Email Content:**
{body}

Email has been delivered to the recipient's inbox."""
                else:
                    final_response = f"❌ Failed to send email: {result.get('error', 'Unknown error')}"
            else:
                final_response = content

        except Exception as e:
            final_response = f"Error sending email: {str(e)}"
    else:
        final_response = content

    return {
        **state,
        "messages": [AIMessage(content=final_response)],
        "final_response": final_response,
        "current_agent": "email",
    }