import { Resend } from "resend";

import { env } from "@/env";
import { ReactNode } from "react";

const resend = new Resend(env.EMAIL_SERVER_PASSWORD);

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactNode
) {
  const { error } = await resend.emails.send({
    from: "Gmela <onboarding@resend.dev>",
    to: email,
    subject,
    react: body,
  });

  if (error) {
    throw error;
  }
}
