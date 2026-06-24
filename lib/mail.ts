import type { Inquiry } from "@/lib/inquiries";

/**
 * 메일 발송 — Resend REST API(https://resend.com)를 fetch 로 직접 호출한다.
 * 추가 npm 의존성 없이 동작하며, 환경변수가 없으면 조용히 skip 한다(개발/미설정 환경 안전).
 *
 * 필요한 환경변수(.env):
 *   RESEND_API_KEY      — 없으면 메일 발송 자체를 건너뜀
 *   INQUIRY_NOTIFY_TO   — 알림 받을 주소(쉼표로 여러 개). 없으면 SUPER_ADMIN_EMAIL
 *   INQUIRY_NOTIFY_FROM — 발신 주소. 없으면 'Codium Lab <onboarding@resend.dev>'(도메인 인증 전 테스트용)
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type SendResult = { ok: boolean; skipped?: boolean; error?: string };

async function sendEmail(opts: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };

  const from =
    process.env.INQUIRY_NOTIFY_FROM || "Codium Lab <onboarding@resend.dev>";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send failed" };
  }
}

function notifyRecipients(): string[] {
  const raw =
    process.env.INQUIRY_NOTIFY_TO || process.env.SUPER_ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 신규 문의가 들어오면 운영자에게 알림 메일을 보낸다.
 * 절대 throw 하지 않는다 — 메일 실패가 문의 접수(200)를 막아선 안 된다.
 */
export async function sendInquiryNotification(
  inquiry: Inquiry,
): Promise<SendResult> {
  const to = notifyRecipients();
  if (to.length === 0) return { ok: false, skipped: true };

  const subject = `[코디움랩] 새 문의 · ${inquiry.name}`;
  const rows: Array<[string, string | null]> = [
    ["이름", inquiry.name],
    ["소속", inquiry.organization],
    ["이메일", inquiry.email],
    ["연락처", inquiry.phone],
  ];
  const rowsHtml = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#71717a;white-space:nowrap">${k}</td><td style="padding:4px 0;color:#18181b">${escapeHtml(
          v as string,
        )}</td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:8px">
      <h2 style="margin:0 0 4px;font-size:18px;color:#18181b">새 문의가 도착했습니다</h2>
      <p style="margin:0 0 16px;font-size:13px;color:#a1a1aa">코디움랩 워크스페이스 · 문의 #${inquiry.id}</p>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">${rowsHtml}</table>
      <div style="border-top:1px solid #e4e4e7;padding-top:12px">
        <p style="margin:0 0 6px;font-size:12px;color:#71717a">문의 내용</p>
        <p style="margin:0;font-size:14px;color:#18181b;white-space:pre-wrap;line-height:1.6">${escapeHtml(
          inquiry.message,
        )}</p>
      </div>
    </div>`;

  return sendEmail({ to, subject, html, replyTo: inquiry.email });
}
