import { Resend } from "resend";
import Welcome from "@/emails/Welcome";
import { NextApiRequest, NextApiResponse } from "next";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, name, quantity } = req.body;

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Hello World",
      react: Welcome({ name, quantity })
    });
    console.log("Resend Response:", res)

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);

    return res.status(500).json({ message: "Failed to send email", error: (error as Error).message });
  }
}
