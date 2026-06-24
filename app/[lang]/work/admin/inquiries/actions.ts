"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/users";
import {
  addInquiryNote,
  isInquiryStatus,
  setInquiryStatus,
} from "@/lib/inquiries";

export async function setInquiryStatusAction(formData: FormData) {
  // 서버 액션은 직접 POST 될 수 있으므로 매번 권한 재확인.
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const lang = String(formData.get("lang") ?? "ko");
  if (!Number.isInteger(id) || !isInquiryStatus(status)) {
    throw new Error("Bad request");
  }

  await setInquiryStatus(id, status);
  revalidatePath(`/${lang}/work/admin/inquiries`);
  revalidatePath(`/${lang}/work`);
}

export async function addInquiryNoteAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  const statusRaw = String(formData.get("status") ?? "");
  const lang = String(formData.get("lang") ?? "ko");
  if (!Number.isInteger(id) || !body) throw new Error("Bad request");

  await addInquiryNote({
    inquiryId: id,
    body,
    status: isInquiryStatus(statusRaw) ? statusRaw : null,
    authorId: ctx.session.id,
    authorName: ctx.session.name,
  });
  revalidatePath(`/${lang}/work/admin/inquiries`);
}
