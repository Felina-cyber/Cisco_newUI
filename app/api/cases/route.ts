import { NextResponse } from "next/server";
import { cases } from "../../../data/cases";

export async function GET() {
  return NextResponse.json(cases);
}
