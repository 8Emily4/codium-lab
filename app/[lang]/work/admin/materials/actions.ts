"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/users";
import {
  createMaterial,
  deleteMaterial,
  revokeGrant,
  setMaterialStatus,
  updateMaterial,
  upsertGrant,
  type MaterialAccess,
  type MaterialStatus,
} from "@/lib/materials";

const STATUSES: MaterialStatus[] = ["draft", "published", "archived"];
const ACCESSES: MaterialAccess[] = ["public", "restricted"];

function s(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/** Parse an <input type="datetime-local"> value into unix seconds, or null. */
function parseEpoch(value: string): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function pickStatus(v: string): MaterialStatus {
  return (STATUSES as string[]).includes(v) ? (v as MaterialStatus) : "draft";
}
function pickAccess(v: string): MaterialAccess {
  return (ACCESSES as string[]).includes(v) ? (v as MaterialAccess) : "restricted";
}

/**
 * 가격(원) 파싱. 무료(public)면 항상 null, 유료(restricted)면 0 이상 정수만 허용.
 * 숫자 외 문자는 제거(예: "50,000원" → 50000).
 */
function pickPrice(value: string, access: MaterialAccess): number | null {
  if (access !== "restricted") return null;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

export async function createMaterialAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");
  const lang = s(formData, "lang") || "ko";
  const title = s(formData, "title");
  if (!title) throw new Error("title required");

  const access = pickAccess(s(formData, "access"));
  const id = await createMaterial({
    title,
    summary: s(formData, "summary") || null,
    body: String(formData.get("body") ?? ""),
    category: s(formData, "category") || null,
    tags: parseTags(s(formData, "tags")),
    status: pickStatus(s(formData, "status")),
    access,
    price: pickPrice(s(formData, "price"), access),
    authorId: ctx.session.id,
    authorName: ctx.session.name,
  });

  revalidatePath(`/${lang}/work/admin/materials`);
  redirect(`/${lang}/work/admin/materials?id=${id}`);
}

export async function updateMaterialAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");
  const lang = s(formData, "lang") || "ko";
  const id = s(formData, "id");
  const title = s(formData, "title");
  if (!id || !title) throw new Error("Bad request");

  const access = pickAccess(s(formData, "access"));
  await updateMaterial(id, {
    title,
    summary: s(formData, "summary") || null,
    body: String(formData.get("body") ?? ""),
    category: s(formData, "category") || null,
    tags: parseTags(s(formData, "tags")),
    status: pickStatus(s(formData, "status")),
    access,
    price: pickPrice(s(formData, "price"), access),
  });

  revalidatePath(`/${lang}/work/admin/materials`);
  redirect(`/${lang}/work/admin/materials?id=${id}`);
}

export async function setStatusAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");
  const lang = s(formData, "lang") || "ko";
  const id = s(formData, "id");
  if (!id) throw new Error("Bad request");
  await setMaterialStatus(id, pickStatus(s(formData, "status")));
  revalidatePath(`/${lang}/work/admin/materials`);
}

export async function deleteMaterialAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");
  const lang = s(formData, "lang") || "ko";
  const id = s(formData, "id");
  if (!id) throw new Error("Bad request");
  await deleteMaterial(id);
  revalidatePath(`/${lang}/work/admin/materials`);
  redirect(`/${lang}/work/admin/materials`);
}

export async function grantAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");
  const lang = s(formData, "lang") || "ko";
  const materialId = s(formData, "materialId");
  const userId = s(formData, "userId");
  if (!materialId || !userId) throw new Error("Bad request");

  await upsertGrant({
    materialId,
    userId,
    startsAt: parseEpoch(s(formData, "startsAt")),
    endsAt: parseEpoch(s(formData, "endsAt")),
    grantedBy: ctx.session.id,
  });
  revalidatePath(`/${lang}/work/admin/materials`);
}

export async function revokeGrantAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");
  const lang = s(formData, "lang") || "ko";
  const materialId = s(formData, "materialId");
  const userId = s(formData, "userId");
  if (!materialId || !userId) throw new Error("Bad request");
  await revokeGrant(materialId, userId);
  revalidatePath(`/${lang}/work/admin/materials`);
}
