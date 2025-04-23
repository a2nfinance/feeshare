"use client"

import {
  Bot,
  Building,
  Building2,
  GiftIcon,
  GitBranchIcon,
  Plus,
  SendIcon,
  SquareTerminal
} from "lucide-react"
import * as React from "react"

import { NavProjects } from "@/components/sidebar/nav-projects"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
// import { Avatar, AvatarImage } from "../ui/avatar"

const data = {
  user: {
    name: "support",
    email: "john@a2n.finance",
    avatar: "/logo/favicon.ico",
  },
  navMain: [
    {
      title: "DAO",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Public DAOs",
          url: "/new-dao",
        },
        {
          title: "Your DAOs",
          url: "#",
        },
        {
          title: "New DAO",
          url: "#",
        },
      ],
    },
    {
      title: "Incentive Programs",
      url: "#",
      icon: Bot,
    },
  ],
  navSecondary: [
    {
      title: "Github",
      url: "https://github.com/a2nfinance/feeshare",
      icon: GitBranchIcon,
    },
    {
      title: "Telegram",
      url: "/",
      icon: SendIcon,
    },
  ],
  projects: [
    {
      name: "Incentive Programs",
      url: "/programs",
      icon: GiftIcon,
    },
    {
      name: "Organizations",
      url: "/daos",
      icon: Building2
    },
    {
      name: "My DAOs",
      url: "/my-daos",
      icon: Building,
    },
    {
      name: "New DAO",
      url: "/new-dao",
      icon: Plus,
    },
 
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary-foreground text-sidebar-primary-foreground">
                  <img src="/logo/icon.png" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FeeShare Platform</span>
                  <span className="truncate text-xs">SwellChain & EigenLayer AVS</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
