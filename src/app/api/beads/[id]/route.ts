import { NextRequest, NextResponse } from "next/server";
import { showIssue, updateIssue } from "@/lib/bd";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const dir = request.nextUrl.searchParams.get("dir");
  if (!dir) {
    return NextResponse.json({ error: "dir parameter required" }, { status: 400 });
  }
  try {
    const issue = await showIssue(id, dir);
    return NextResponse.json(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  let body: { dir?: string; updates?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { dir, updates } = body;
  if (!dir) {
    return NextResponse.json({ error: "dir field required in body" }, { status: 400 });
  }
  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ error: "updates field required in body" }, { status: 400 });
  }

  try {
    await updateIssue(id, dir, updates);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
