import type { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  onCreateClick: () => void;
  totalMissions: number;
}

export function Layout({ children, onCreateClick, totalMissions }: LayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Header
          onCreateClick={onCreateClick}
          totalMissions={totalMissions}
        />
        <section className="content-area">{children}</section>
      </main>
    </div>
  );
}
