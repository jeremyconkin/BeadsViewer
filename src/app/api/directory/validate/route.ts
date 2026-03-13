import { NextRequest, NextResponse } from "next/server";
import { validateDirectory } from "@/lib/bd";

export async function POST(request: NextRequest) {
  let body: { path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { path: dirPath } = body;
  if (!dirPath) {
    return NextResponse.json({ error: "path field required in body" }, { status: 400 });
  }

  try {
    const result = await validateDirectory(dirPath);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
