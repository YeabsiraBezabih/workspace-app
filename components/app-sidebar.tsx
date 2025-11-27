"use client";

import { Table as TableIcon, Users, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveOrganization, useListOrganizations, organization } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Menu items grouped by category
const platformItems = [
  {
    title: "Table",
    url: "/table",
    icon: TableIcon,
  },
];

const teamSetupItems = [
  {
    title: "Team Info / Setup",
    url: "/team",
    icon: Users,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: activeOrg } = useActiveOrganization();
  const { data: organizations } = useListOrganizations();

  const handleOrgChange = (orgId: string) => {
    organization.setActive({
      organizationId: orgId,
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 hover:bg-accent"
            >
              <div className="text-left">
                <div className="text-sm font-semibold">
                  {activeOrg?.name || "No Organization"}
                </div>
                <div className="text-xs text-muted-foreground">Enterprise</div>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {organizations && organizations.length > 0 ? (
              <>
                {organizations.map((org, index) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleOrgChange(org.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{org.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ⌘{index + 1}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem asChild>
              <Link href="/create-organization" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add team
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {teamSetupItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
