import { NextResponse } from "next/server";
import { createInquiry, getInquiry } from "@/lib/inquiries";
import { sendInquiryNotification } from "@/lib/mail";

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

  const id = await createInquiry({
    name,
    organization: organization || null,
    email,
    phone: phone || null,
    message,
  });

  // 알림 메일은 부가 작업 — 실패해도 문의 접수(200)는 막지 않는다.
  try {
    const inquiry = await getInquiry(id);
    if (inquiry) {
      const result = await sendInquiryNotification(inquiry);
      if (!result.ok && !result.skipped) {
        console.warn("[inquiry] notification email failed:", result.error);
      }
    }
  } catch (err) {
    console.warn("[inquiry] notification email threw:", err);
  }

  return NextResponse.json({ ok: true });
}
