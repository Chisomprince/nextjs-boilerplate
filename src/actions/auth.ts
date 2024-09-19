"use server";

import bcrypt from "bcryptjs";

import { applicationName, DEFAULT_LOGIN_REDIRECT } from "@/lib/app-config";
import { signIn, signOut } from "@/lib/auth";
import {
  generatePasswordResetToken,
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import AuthService from "@/lib/db/services/auth";
import UserService from "@/lib/db/services/user";
import { sendEmail } from "@/lib/email/send-email";
import { ResetPasswordEmail } from "@/lib/email/templates/reset-password";
import { VerifyEmail } from "@/lib/email/templates/verify-email";
import { actionClient } from "@/lib/safe-actions";
import {
  LoginSchema,
  NewPasswordSchema,
  RegisterSchema,
  ResetSchema,
} from "@/lib/validations/auth";
import { AuthError } from "next-auth";
import React from "react";
import { z } from "zod";

export const register = actionClient
  .schema(RegisterSchema)
  .action(async ({ parsedInput }) => {
    const { email, password, name } = parsedInput;

    const existingUser = await UserService.getUserByEmail(email);

    if (existingUser) {
      return { error: "Email already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const verificationToken = await generateVerificationToken(email);
    const html = React.createElement(VerifyEmail, {
      token: verificationToken.token,
    });

    await sendEmail(email, `Verify your email for ${applicationName}`, html);

    return { success: "Confirmation email sent!" };
  });

export const newVerification = actionClient
  .schema(z.object({ token: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const { token } = parsedInput;

    const existingToken = await AuthService.getVerificationTokenByToken(token);

    if (!existingToken) {
      return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return { error: "Token has expired!" };
    }

    const existingUser = await UserService.getUserByEmail(existingToken.email);

    if (!existingUser) {
      return { error: "Email does not exist!" };
    }

    await db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      },
    });

    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return { success: "Email verified!" };
  });

export const login = actionClient
  .schema(LoginSchema)
  .action(async ({ parsedInput }) => {
    const { email, password, code } = parsedInput;

    const existingUser = await UserService.getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
      return { error: "Email does not exist!" };
    }

    if (!existingUser.emailVerified) {
      const verificationToken = await generateVerificationToken(email);
      const html = React.createElement(VerifyEmail, {
        token: verificationToken.token,
      });

      await sendEmail(email, `Verify your email for ${applicationName}`, html);
      return { success: "Confirmation email sent!" };
    }

    if (existingUser.isTwoFactorEnabled && existingUser.email) {
      if (code) {
        const twoFactorToken = await AuthService.getTwoFactorTokenByEmail(
          existingUser.email
        );

        if (!twoFactorToken) {
          return { error: "Invalid code!" };
        }

        if (twoFactorToken.token !== code) {
          return { error: "Invalid code!" };
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date();

        if (hasExpired) {
          return { error: "Code expired!" };
        }

        await db.twoFactorToken.delete({
          where: { id: twoFactorToken.id },
        });

        const existingConfirmation =
          await AuthService.getTwoFactorConfirmationByUserId(existingUser.id);

        if (existingConfirmation) {
          await db.twoFactorConfirmation.delete({
            where: { id: existingConfirmation.id },
          });
        }

        await db.twoFactorConfirmation.create({
          data: {
            userId: existingUser.id,
          },
        });
      } else {
        const twoFactorToken = await generateTwoFactorToken(existingUser.email);
        const html = React.createElement(VerifyEmail, {
          token: twoFactorToken.token,
        });

        await sendEmail(
          email,
          `Verify your email for ${applicationName}`,
          html
        );

        return { twoFactor: true };
      }
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: parsedInput.callbackUrl || DEFAULT_LOGIN_REDIRECT,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Invalid credentials!" };
          default:
            return { error: "Something went wrong!" };
        }
      }

      throw error;
    }
  });

export const reset = actionClient
  .schema(ResetSchema)
  .action(async ({ parsedInput: { email } }) => {
    const existingUser = await UserService.getUserByEmail(email);

    if (!existingUser) {
      return { error: "Email not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    const html = React.createElement(ResetPasswordEmail, {
      token: passwordResetToken.token,
    });
    await sendEmail(email, `Reset your password for ${applicationName}`, html);

    return { success: "Reset email sent!" };
  });

export const newPassword = actionClient
  .schema(NewPasswordSchema)
  .action(async ({ parsedInput: { password, token } }) => {
    if (!token) {
      return { error: "Missing token!" };
    }

    const existingToken = await AuthService.getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return { error: "Invalid token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return { error: "Token has expired!" };
    }

    const existingUser = await UserService.getUserByEmail(existingToken.email);

    if (!existingUser) {
      return { error: "Email does not exist!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return { success: "Password updated!" };
  });

export const logout = async () => {
  await signOut();
};
