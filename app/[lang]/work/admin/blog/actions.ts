"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/users";
import {
  createPost,
  deletePost,
  setPostFlag,
  updatePost,
  type BlogInput,
} from "@/lib/blog";
import { setBlogNavVisible } from "@/lib/settings";

function revalidate(lang: string) {
  revalidatePath(`/${lang}/work/admin/blog`);
  revalidatePath(`/${lang}/blog`);
}

function parseInput(formData: FormData): BlogInput {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Bad request: title is required");

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    title,
    slug: String(formData.get("slug") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    body: String(formData.get("body") ?? ""),
    thumbnail: String(formData.get("thumbnail") ?? ""),
    tags,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };
}

export async function createPostAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const lang = String(formData.get("lang") ?? "ko");
  await createPost(parseInput(formData), {
    id: ctx.session.id,
    name: ctx.session.name ?? null,
  });
  revalidate(lang);
}

export async function updatePostAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad request: invalid id");

  const lang = String(formData.get("lang") ?? "ko");
  await updatePost(id, parseInput(formData));
  revalidate(lang);
}

export async function deletePostAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad request: invalid id");

  const lang = String(formData.get("lang") ?? "ko");
  await deletePost(id);
  revalidate(lang);
}

export async function togglePostFlagAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  const flag = String(formData.get("flag") ?? "");
  const value = String(formData.get("value") ?? "") === "1";
  if (!Number.isInteger(id) || (flag !== "published" && flag !== "featured")) {
    throw new Error("Bad request");
  }

  const lang = String(formData.get("lang") ?? "ko");
  await setPostFlag(id, flag, value);
  revalidate(lang);
}

/** Toggle whether the 기술블로그 menu appears in the public nav. */
export async function setBlogNavAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const value = String(formData.get("value") ?? "") === "1";
  const lang = String(formData.get("lang") ?? "ko");
  await setBlogNavVisible(value);
  revalidate(lang);
}
