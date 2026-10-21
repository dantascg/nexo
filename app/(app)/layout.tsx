import Sidebar from "../components/Sidebar";
import styles from "../styles/dashboard.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        {children}
      </div>
    </div>
  );
}
