import { currentUser } from "@/lib/auth/session";

import { UserInfo } from "@/components/user-info";

const DashboardPage = async () => {
  const user = await currentUser();

  return <UserInfo label="💻 Server component" user={user} />;
};

export default DashboardPage;
