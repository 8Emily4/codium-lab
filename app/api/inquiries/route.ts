import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";

export const runtime = "nodejs";

type InquiryBody = {
  name?: unknown;
  organization?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

function asTrimmedString(v: unknown, max = 1000): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: InquiryBody;
  try {
    body = (await request.json()) as InquiryBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const name = asTrimmedString(body.name, 80);
  const organization = asTrimmedString(body.organization, 120);
  const email = asTrimmedString(body.email, 200);
  const phone = asTrimmedString(body.phone, 40);
  const message = asTrimmedString(body.message, 2000);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "이름, 이메일, 문의 내용은 필수입니다." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "이메일 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO inquiries (name, organization, email, phone, message)
          VALUES (?, ?, ?, ?, ?)`,
    args: [name, organization || null, email, phone || null, message],
  });

  return NextResponse.json({ ok: true });
}
