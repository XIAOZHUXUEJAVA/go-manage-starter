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
  FileText,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/authStore";

// This is sample data.
const data = {
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
    // {
    //   title: "文章管理",
    //   url: "/dashboard/articlemanage",
    //   icon: FileText,
    //   items: [
    //     {
    //       title: "文章列表",
    //       url: "/dashboard/articlemanage",
    //     },
    //     {
    //       title: "分类管理",
    //       url: "/dashboard/articlemanage/categories",
    //     },
    //     {
    //       title: "标签管理",
    //       url: "/dashboard/articlemanage/tags",
    //     },
    //   ],
    // },
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
  const { user } = useAuthStore();

  // 构建用户数据，如果没有登录用户则使用默认值
  const userData = {
    name: user?.username || "Guest",
    email: user?.email || "guest@example.com",
    avatar: user?.avatar || "/avatars/default.jpg",
  };

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
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
