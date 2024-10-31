import { Resend } from "resend";
import Welcome from "@/emails/Welcome";
import {NextApiRequest} from "next";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function POST(request: NextApiRequest) {
  const { email, name, quantity } = await request.body;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "hello world",
    react: Welcome({ name, quantity }),
  });
}
