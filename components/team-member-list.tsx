"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useActiveOrganization, useSession, organization } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TeamMemberList() {
  const { data: activeOrg } = useActiveOrganization();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  // Check if current user is owner
  const currentUserMember = activeOrg?.members?.find(
    (m) => m.userId === session?.user.id
  );
  const isOwner = currentUserMember?.role === "owner";

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setLoading(memberId);
    try {
      await organization.removeMember({
        memberIdOrEmail: memberId, // Check if this expects ID or Email, usually ID of the member record or userId
        organizationId: activeOrg!.id,
      });
      // Optimistic update or refetch handled by better-auth hooks usually
    } catch (error) {
      console.error("Failed to remove member", error);
    } finally {
      setLoading(null);
    }
  };

  if (!activeOrg) return null;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeOrg.members?.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user.image || ""} />
                  <AvatarFallback>
                    {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                  {member.role}
                </Badge>
              </TableCell>
              <TableCell>
                {isOwner && member.userId !== session?.user.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveMember(member.id)} // Pass member.id (organization member ID)
                    disabled={loading === member.id}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
