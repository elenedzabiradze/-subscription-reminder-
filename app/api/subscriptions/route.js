import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { listSubscriptions, createSubscription } from "../../../lib/calendar";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const subscriptions = await listSubscriptions(session.accessToken);
    return NextResponse.json({ subscriptions });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const body = await request.json();
  const { name, price, currency, day } = body;
  if (!name || !price || !currency || !day) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (Number(day) < 1 || Number(day) > 31) {
    return NextResponse.json({ error: "Billing day must be between 1 and 31" }, { status: 400 });
  }
  try {
    const event = await createSubscription(session.accessToken, { name, price, currency, day });
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
