from langchain_core.messages import AIMessage, SystemMessage
from app.agents.state import AgentState
from app.agents.supervisor import get_llm
from app.integrations.gmail import send_email, parse_recipients
import re

EMAIL_PROMPT = """You are an AI Email Assistant for a business.

When the user wants to send an email:
1. Extract ALL recipient email addresses from the request. If multiple recipients are given, include every one of them, separated by commas.
2. If the user did NOT provide a subject and/or body, DRAFT them yourself. Never ask the user for more details — write a professional subject and body based on the user's request.
3. Respond ONLY with the following block, with no extra commentary:

SEND_EMAIL
TO: recipient1@example.com, recipient2@example.com
SUBJECT: Subject here
BODY:
Email body here...
END_EMAIL

Rules:
- The TO line must contain only valid email addresses, comma-separated.
- The BODY must end with END_EMAIL on its own line.
- If the request does NOT include any email address, do NOT output SEND_EMAIL. Just draft the email as normal text instead.
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
                to_emails = parse_recipients(to_match.group(1))
                subject = subject_match.group(1).strip()
                body = body_match.group(1).strip()

                if not to_emails:
                    final_response = "I couldn't find a valid recipient email address. Please provide the recipient's email so I can send it."
                else:
                    # Send real email
                    result = send_email(
                        to_email=to_emails,
                        subject=subject,
                        body=body,
                    )

                    if result["success"]:
                        recipients = ", ".join(to_emails)
                        final_response = f"""✅ Email sent successfully!

**To:** {recipients}
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