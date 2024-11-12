import { Resend } from "resend";
import Welcome from "../emails/Welcome.jsx";

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function SendEmail({ email, name, quantity }: {email:string, name:string, quantity:number }) {
  try {
    await resend.emails.send({
      from: "Pour la joie de Marie <noreply@pourlajoiedemarie.com>",
      to: [email],
      subject: `Merci pour votre promesse ${name} 🤩`,
      react: Welcome({ name, quantity })
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
