import { db } from "@/lib/db";

const UserService = {
  getUserByEmail: async (email: string) => {
    try {
      const user = await db.user.findUnique({ where: { email } });

      return user;
    } catch {
      return null;
    }
  },
  getUserById: async (id: string) => {
    try {
      const user = await db.user.findUnique({ where: { id } });

      return user;
    } catch {
      return null;
    }
  },
};

export default UserService;
