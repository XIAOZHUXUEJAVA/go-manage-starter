"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard 布局组件
 * 为所有 dashboard 子页面提供统一的侧边栏和布局结构
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
