import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "No userId provided" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("userId", userId, {
    httpOnly: true,
    secure: true,        // REQUIRED en Workstation
    sameSite: "none",    // REQUIRED en Workstation
    path: "/",
  });

  res.headers.set("Access-Control-Allow-Credentials", "true");

  return res;
}
