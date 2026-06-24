"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/users";
import {
  createChannel,
  createMedia,
  deleteChannel,
  deleteMedia,
  isMediaType,
  resolveYouTubeChannel,
  setChannelFlag,
  setMediaFlag,
  updateMedia,
  type MediaInput,
} from "@/lib/media";

function revalidate(lang: string) {
  revalidatePath(`/${lang}/work/admin/content`);
  revalidatePath(`/${lang}/media`);
}

function parseInput(formData: FormData): MediaInput {
  const type = String(formData.get("type") ?? "");
  if (!isMediaType(type)) throw new Error("Bad request: invalid type");

  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!title || !url) throw new Error("Bad request: title and url are required");

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    type,
    title,
    url,
    description: String(formData.get("description") ?? ""),
    thumbnail: String(formData.get("thumbnail") ?? ""),
    tags,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };
}

export async function createMediaAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const lang = String(formData.get("lang") ?? "ko");
  await createMedia(parseInput(formData), ctx.session.id);
  revalidate(lang);
}

export async function updateMediaAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad request: invalid id");

  const lang = String(formData.get("lang") ?? "ko");
  await updateMedia(id, parseInput(formData));
  revalidate(lang);
}

export async function deleteMediaAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad request: invalid id");

  const lang = String(formData.get("lang") ?? "ko");
  await deleteMedia(id);
  revalidate(lang);
}

export async function toggleMediaFlagAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  const flag = String(formData.get("flag") ?? "");
  const value = String(formData.get("value") ?? "") === "1";
  if (!Number.isInteger(id) || (flag !== "published" && flag !== "featured")) {
    throw new Error("Bad request");
  }

  const lang = String(formData.get("lang") ?? "ko");
  await setMediaFlag(id, flag, value);
  revalidate(lang);
}

/* ── YouTube channels ───────────────────────────────────────────────── */

export async function createChannelAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const lang = String(formData.get("lang") ?? "ko");
  const input = String(formData.get("channel") ?? "").trim();
  if (!input) throw new Error("채널 URL 또는 @핸들을 입력해 주세요.");

  // Resolve upstream (network) before writing — throws a user-facing message.
  const resolved = await resolveYouTubeChannel(input);
  await createChannel(resolved, ctx.session.id);
  revalidate(lang);
}

export async function deleteChannelAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad request: invalid id");

  const lang = String(formData.get("lang") ?? "ko");
  await deleteChannel(id);
  revalidate(lang);
}

export async function toggleChannelFlagAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  const flag = String(formData.get("flag") ?? "");
  const value = String(formData.get("value") ?? "") === "1";
  if (!Number.isInteger(id) || (flag !== "published" && flag !== "featured")) {
    throw new Error("Bad request");
  }

  const lang = String(formData.get("lang") ?? "ko");
  await setChannelFlag(id, flag, value);
  revalidate(lang);
}
