import { NextRequest, NextResponse } from "next/server";
import { routeCase } from "./caseAutomation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.query || typeof body.query !== "string") {
      return NextResponse.json({ error: "Missing 'query' string" }, { status: 400 });
    }
    const result = await routeCase({ query: body.query, hints: body.hints });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Routing error" }, { status: 500 });
  }
}
