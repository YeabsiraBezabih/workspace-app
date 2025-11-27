import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the original outline
    const original = await prisma.outline.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Outline not found" }, { status: 404 });
    }

    if (original.organization.members.length === 0) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Create duplicate
    const duplicate = await prisma.outline.create({
      data: {
        header: `${original.header} (Copy)`,
        sectionType: original.sectionType,
        status: original.status,
        target: original.target,
        limit: original.limit,
        reviewer: original.reviewer,
        organizationId: original.organizationId,
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("Error duplicating outline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
