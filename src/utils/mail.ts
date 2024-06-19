const apiUrl = "https://api.emailjs.com/api/v1.0/email/send";
const serviceId = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID;
const userId = import.meta.env.PUBLIC_EMAILJS_USER_ID;

export interface Mail {
  name: string;
  email: string;
  message: string;
}

export async function sendMail(mail: Mail) {
  const body = JSON.stringify({
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: mail,
  });

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
