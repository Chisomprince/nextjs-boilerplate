import { db } from "@/lib/db";

const AuthService = {
  // Account
  getAccountByUserId: async (userId: string) => {
    try {
      const account = await db.account.findFirst({
        where: { userId },
      });

      return account;
    } catch {
      return null;
    }
  },

  // Password Reset
  getPasswordResetTokenByToken: async (token: string) => {
    try {
      const passwordResetToken = await db.passwordResetToken.findUnique({
        where: { token },
      });

      return passwordResetToken;
    } catch {
      return null;
    }
  },

  getPasswordResetTokenByEmail: async (email: string) => {
    try {
      const passwordResetToken = await db.passwordResetToken.findFirst({
        where: { email },
      });

      return passwordResetToken;
    } catch {
      return null;
    }
  },

  // Two Factor Confirmation
  getTwoFactorConfirmationByUserId: async (userId: string) => {
    try {
      const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
        where: { userId },
      });

      return twoFactorConfirmation;
    } catch {
      return null;
    }
  },

  getTwoFactorTokenByToken: async (token: string) => {
    try {
      const twoFactorToken = await db.twoFactorToken.findUnique({
        where: { token },
      });

      return twoFactorToken;
    } catch {
      return null;
    }
  },

  getTwoFactorTokenByEmail: async (email: string) => {
    try {
      const twoFactorToken = await db.twoFactorToken.findFirst({
        where: { email },
      });

      return twoFactorToken;
    } catch {
      return null;
    }
  },

  // Verification
  getVerificationTokenByToken: async (token: string) => {
    try {
      const verificationToken = await db.verificationToken.findUnique({
        where: { token },
      });

      return verificationToken;
    } catch {
      return null;
    }
  },

  getVerificationTokenByEmail: async (email: string) => {
    try {
      const verificationToken = await db.verificationToken.findFirst({
        where: { email },
      });

      return verificationToken;
    } catch {
      return null;
    }
  },
};

export default AuthService;
