"use client";

import { useActiveOrganization, useSession } from "@/lib/auth-client";
import { TeamMemberList } from "@/components/team-member-list";
import { InviteMemberDialog } from "@/components/invite-member-dialog";

export default function TeamPage() {
  const { data: activeOrg } = useActiveOrganization();
  const { data: session } = useSession();

  const isOwner = activeOrg?.members?.find(
    (m) => m.userId === session?.user.id
  )?.role === "owner";

  if (!activeOrg) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Manage members of {activeOrg.name}
          </p>
        </div>
        {isOwner && <InviteMemberDialog />}
      </div>

      <TeamMemberList />
    </div>
  );
}
