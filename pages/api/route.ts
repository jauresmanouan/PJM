import Cors from 'cors';
import { Resend } from "resend";
import Welcome from "@/emails/Welcome";
import { NextApiRequest, NextApiResponse } from "next";


const cors = Cors({origin : "http://localhost:5173", methods: "POST"})

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: NextApiRequest, res: NextApiResponse, callback: (result: any) => void) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, name, quantity } = req.body;

    await resend.emails.send({
      from: "Pour la joie de Marie <onboarding@resend.dev>",
      to: [email],
      subject: `Merci pour votre promesse ${name} 🤩`,
      react: Welcome({ name, quantity })
    });
    console.log("Resend Response:", res)

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);

    return res.status(500).json({ message: "Failed to send email", error: (error as Error).message });
  }
}
