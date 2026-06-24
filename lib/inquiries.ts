import { ensureSchema, getDb } from "@/lib/db";

/** 문의 진행 상태. 'new' = 아직 확인 안 함(미확인 알림 대상). */
export const INQUIRY_STATUSES = [
  "new",
  "inProgress",
  "done",
  "archived",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export function isInquiryStatus(v: unknown): v is InquiryStatus {
  return (
    typeof v === "string" &&
    (INQUIRY_STATUSES as readonly string[]).includes(v)
  );
}

export type Inquiry = {
  id: number;
  name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: number;
  updatedAt: number | null;
  noteCount: number;
};

export type InquiryNote = {
  id: number;
  inquiryId: number;
  body: string;
  status: InquiryStatus | null;
  authorName: string | null;
  createdAt: number;
};

function num(v: unknown): number {
  return typeof v === "bigint" ? Number(v) : Number(v ?? 0);
}
function str(v: unknown): string {
  return v == null ? "" : String(v);
}
function strOrNull(v: unknown): string | null {
  return v == null ? null : String(v);
}

function toInquiry(r: Record<string, unknown>): Inquiry {
  const status = r.status;
  return {
    id: num(r.id),
    name: str(r.name),
    organization: strOrNull(r.organization),
    email: str(r.email),
    phone: strOrNull(r.phone),
    message: str(r.message),
    status: isInquiryStatus(status) ? status : "new",
    createdAt: num(r.created_at),
    updatedAt: r.updated_at == null ? null : num(r.updated_at),
    noteCount: num(r.note_count),
  };
}

export type NewInquiry = {
  name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  message: string;
};

/** 문의를 저장하고 새 행의 id 를 돌려준다. */
export async function createInquiry(input: NewInquiry): Promise<number> {
  await ensureSchema();
  const res = await getDb().execute({
    sql: `INSERT INTO inquiries (name, organization, email, phone, message)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      input.name,
      input.organization,
      input.email,
      input.phone,
      input.message,
    ],
  });
  return num(res.lastInsertRowid);
}

/** 모든 문의를 최신순으로. 각 문의의 메모 개수를 함께 집계. */
export async function listInquiries(): Promise<Inquiry[]> {
  await ensureSchema();
  const res = await getDb().execute(`
    SELECT i.*, (
      SELECT COUNT(*) FROM inquiry_notes n WHERE n.inquiry_id = i.id
    ) AS note_count
    FROM inquiries i
    ORDER BY i.created_at DESC, i.id DESC
  `);
  return res.rows.map((r) => toInquiry(r as Record<string, unknown>));
}

export async function getInquiry(id: number): Promise<Inquiry | null> {
  await ensureSchema();
  const res = await getDb().execute({
    sql: `SELECT i.*, (
            SELECT COUNT(*) FROM inquiry_notes n WHERE n.inquiry_id = i.id
          ) AS note_count
          FROM inquiries i WHERE i.id = ?`,
    args: [id],
  });
  const row = res.rows[0];
  return row ? toInquiry(row as Record<string, unknown>) : null;
}

/** 상태별 개수. 미설정 상태는 0 으로 채워 항상 모든 키를 반환. */
export async function countInquiriesByStatus(): Promise<
  Record<InquiryStatus, number>
> {
  await ensureSchema();
  const res = await getDb().execute(
    `SELECT status, COUNT(*) AS c FROM inquiries GROUP BY status`,
  );
  const counts: Record<InquiryStatus, number> = {
    new: 0,
    inProgress: 0,
    done: 0,
    archived: 0,
  };
  for (const r of res.rows) {
    const s = (r as Record<string, unknown>).status;
    if (isInquiryStatus(s)) counts[s] = num((r as Record<string, unknown>).c);
  }
  return counts;
}

/** 미확인(new) 문의 개수 — 워크스페이스 알림 배지용. */
export async function countNewInquiries(): Promise<number> {
  await ensureSchema();
  const res = await getDb().execute(
    `SELECT COUNT(*) AS c FROM inquiries WHERE status = 'new'`,
  );
  return num((res.rows[0] as Record<string, unknown> | undefined)?.c);
}

export async function setInquiryStatus(
  id: number,
  status: InquiryStatus,
): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `UPDATE inquiries SET status = ?, updated_at = unixepoch() WHERE id = ?`,
    args: [status, id],
  });
}

export async function addInquiryNote(input: {
  inquiryId: number;
  body: string;
  status: InquiryStatus | null;
  authorId: string | null;
  authorName: string | null;
}): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO inquiry_notes (inquiry_id, body, status, author_id, author_name)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      input.inquiryId,
      input.body,
      input.status,
      input.authorId,
      input.authorName,
    ],
  });
  // 메모를 남기면 문의가 "처리 중"임을 드러내도록 updated_at 갱신.
  await getDb().execute({
    sql: `UPDATE inquiries SET updated_at = unixepoch() WHERE id = ?`,
    args: [input.inquiryId],
  });
}

export async function listInquiryNotes(
  inquiryId: number,
): Promise<InquiryNote[]> {
  await ensureSchema();
  const res = await getDb().execute({
    sql: `SELECT * FROM inquiry_notes WHERE inquiry_id = ? ORDER BY created_at DESC, id DESC`,
    args: [inquiryId],
  });
  return res.rows.map((r) => {
    const row = r as Record<string, unknown>;
    const status = row.status;
    return {
      id: num(row.id),
      inquiryId: num(row.inquiry_id),
      body: str(row.body),
      status: isInquiryStatus(status) ? status : null,
      authorName: strOrNull(row.author_name),
      createdAt: num(row.created_at),
    };
  });
}
