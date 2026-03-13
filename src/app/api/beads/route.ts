import { NextRequest, NextResponse } from "next/server";
import { listIssues } from "@/lib/bd";

export async function GET(request: NextRequest) {
  const dir = request.nextUrl.searchParams.get("dir");
  if (!dir) {
    return NextResponse.json({ error: "dir parameter required" }, { status: 400 });
  }
  try {
    const issues = await listIssues(dir);
    return NextResponse.json(issues);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
