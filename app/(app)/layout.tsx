import { Suspense } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import { UserProvider } from "../components/UserProvider";
import { getCurrentUser } from "@/lib/auth";
import styles from "../styles/dashboard.module.css";

export const instant = false;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className={styles.shell} />}>
      <AuthedShell>{children}</AuthedShell>
    </Suspense>
  );
}

async function AuthedShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <UserProvider user={user}>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.main}>{children}</div>
        <BottomNav />
      </div>
    </UserProvider>
  );
}
