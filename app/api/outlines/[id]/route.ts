import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateOutlineSchema } from "@/lib/validations";
import { headers } from "next/headers";

export async function PUT(
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

    const body = await req.json();

    // Fetch the outline to verify ownership
    const existingOutline = await prisma.outline.findUnique({
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

    if (!existingOutline) {
      return NextResponse.json({ error: "Outline not found" }, { status: 404 });
    }

    if (existingOutline.organization.members.length === 0) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Validate outline data
    const validatedData = updateOutlineSchema.parse(body);

    // Update outline
    const outline = await prisma.outline.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(outline);
  } catch (error) {
    console.error("Error updating outline:", error);
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

export async function DELETE(
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

    // Fetch the outline to verify ownership
    const existingOutline = await prisma.outline.findUnique({
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

    if (!existingOutline) {
      return NextResponse.json({ error: "Outline not found" }, { status: 404 });
    }

    if (existingOutline.organization.members.length === 0) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Delete outline
    await prisma.outline.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Outline deleted successfully" });
  } catch (error) {
    console.error("Error deleting outline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
