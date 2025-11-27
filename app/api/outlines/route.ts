import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOutlineSchema } from "@/lib/validations";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's active organization from query params or session
    const organizationId = req.nextUrl.searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Fetch outlines for the organization
    const outlines = await prisma.outline.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(outlines);
  } catch (error) {
    console.error("Error fetching outlines:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, ...outlineData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Validate outline data
    const validatedData = createOutlineSchema.parse(outlineData);

    // Create outline
    const outline = await prisma.outline.create({
      data: {
        ...validatedData,
        organizationId,
      },
    });

    return NextResponse.json(outline, { status: 201 });
  } catch (error) {
    console.error("Error creating outline:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
