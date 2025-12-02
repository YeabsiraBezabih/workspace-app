"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Suspense } from "react";

function JoinOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invitationId, setInvitationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("invitationId");
    if (id) {
      setInvitationId(id);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        setError(error.message || "Failed to join organization");
        setLoading(false);
        return;
      }

      if (data) {
        router.push("/table");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Join Organization</CardTitle>
          <CardDescription>
            Enter your invitation ID to join a workspace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="invitationId">Invitation ID</Label>
              <Input
                id="invitationId"
                type="text"
                placeholder="inv_..."
                value={invitationId}
                onChange={(e) => setInvitationId(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining..." : "Join Organization"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/create-organization")}
            >
              Create a new organization
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function JoinOrganizationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinOrganizationContent />
    </Suspense>
  );
}
