"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  LayoutDashboard,
  Database,
  Shield,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "仪表板",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "概览",
          url: "/dashboard",
        },
        {
          title: "统计",
          url: "/dashboard/analytics",
        },
        {
          title: "报告",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "用户管理",
      url: "/dashboard/usersmanage",
      icon: Users,
      items: [
        {
          title: "用户列表",
          url: "/dashboard/usersmanage",
        },
        {
          title: "用户角色",
          url: "/dashboard/usersmanage/roles",
        },
        {
          title: "权限管理",
          url: "/dashboard/usersmanage/permissions",
        },
      ],
    },
    {
      title: "数据管理",
      url: "#",
      icon: Database,
      items: [
        {
          title: "数据导入",
          url: "/dashboard/data/import",
        },
        {
          title: "数据导出",
          url: "/dashboard/data/export",
        },
        {
          title: "数据备份",
          url: "/dashboard/data/backup",
        },
      ],
    },
    {
      title: "系统设置",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "基本设置",
          url: "/dashboard/settings/general",
        },
        {
          title: "安全设置",
          url: "/dashboard/settings/security",
        },
        {
          title: "通知设置",
          url: "/dashboard/settings/notifications",
        },
      ],
    },
  ],
  projects: [
    {
      name: "系统监控",
      url: "/dashboard/monitoring",
      icon: Frame,
    },
    {
      name: "数据分析",
      url: "/dashboard/analytics",
      icon: PieChart,
    },
    {
      name: "日志管理",
      url: "/dashboard/logs",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
