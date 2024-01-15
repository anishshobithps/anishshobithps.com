const ENDPOINT = "https://api.anishshobithps.com/sendemail";

export interface Mail {
  name: string;
  email: string;
  subject: string;
  message: string;
  token: string;
}

export async function sendMail(mail: Mail) {
  const body = JSON.stringify({
    name: mail.name,
    email: mail.email,
    subject: mail.subject,
    message: mail.message,
  });

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application.json",
        Authorization: `Bearer ${mail.token}`,
      },
    });
    return res.status === 200;
  } catch (error) {
    console.log(error);
    return false;
  }
}
