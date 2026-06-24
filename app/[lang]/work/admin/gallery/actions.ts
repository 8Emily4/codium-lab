"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { requireAdmin } from "@/lib/users";
import { parseYouTubeId } from "@/lib/media";
import {
  createGalleryImage,
  createGalleryVideo,
  deleteGalleryItem,
  replaceGalleryImage,
  setGalleryFlag,
  updateGalleryMeta,
} from "@/lib/gallery";

function revalidate(lang: string) {
  revalidatePath(`/${lang}/work/admin/gallery`);
  revalidatePath(`/${lang}/gallery`);
}

/** 업로드 원본을 webp 로 리사이즈·압축해 DB 저장에 적합한 형태로 변환. */
async function processImage(
  file: File,
): Promise<{ data: Uint8Array; mime: string; width: number; height: number }> {
  const buf = Buffer.from(await file.arrayBuffer());
  // rotate(): EXIF 방향 보정. 최대 1600px 안쪽으로 축소(확대는 안 함).
  const out = await sharp(buf, { failOn: "none" })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return {
    data: new Uint8Array(out.data),
    mime: "image/webp",
    width: out.info.width,
    height: out.info.height,
  };
}

function readMeta(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("제목을 입력해 주세요.");
  return {
    title,
    description: String(formData.get("description") ?? ""),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };
}

export async function createGalleryAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const lang = String(formData.get("lang") ?? "ko");
  const kind = String(formData.get("kind") ?? "image");
  const meta = readMeta(formData);

  if (kind === "video") {
    const videoUrl = String(formData.get("videoUrl") ?? "").trim();
    if (!videoUrl) throw new Error("영상 URL 을 입력해 주세요.");
    if (!parseYouTubeId(videoUrl)) {
      throw new Error("유효한 YouTube 영상 URL 이 아닙니다.");
    }
    await createGalleryVideo({ ...meta, videoUrl }, ctx.session.id);
  } else {
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("이미지 파일을 선택해 주세요.");
    }
    const img = await processImage(file);
    await createGalleryImage({ ...meta, ...img }, ctx.session.id);
  }

  revalidate(lang);
}

export async function updateGalleryAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad request: invalid id");

  const lang = String(formData.get("lang") ?? "ko");
  const kind = String(formData.get("kind") ?? "image");
  const meta = readMeta(formData);

  let videoUrl: string | null = null;
  if (kind === "video") {
    videoUrl = String(formData.get("videoUrl") ?? "").trim();
    if (!videoUrl) throw new Error("영상 URL 을 입력해 주세요.");
    if (!parseYouTubeId(videoUrl)) {
      throw new Error("유효한 YouTube 영상 URL 이 아닙니다.");
    }
  }

  await updateGalleryMeta(id, { ...meta, videoUrl });

  // 이미지 항목은 새 파일이 첨부된 경우에만 바이트를 교체합니다.
  if (kind === "image") {
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const img = await processImage(file);
      await replaceGalleryImage(id, img.data, img.mime, img.width, img.height);
    }
  }

  revalidate(lang);
}

export async function deleteGalleryAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad request: invalid id");

  const lang = String(formData.get("lang") ?? "ko");
  await deleteGalleryItem(id);
  revalidate(lang);
}

export async function toggleGalleryFlagAction(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) throw new Error("Unauthorized");

  const id = Number(formData.get("id"));
  const flag = String(formData.get("flag") ?? "");
  const value = String(formData.get("value") ?? "") === "1";
  if (!Number.isInteger(id) || (flag !== "published" && flag !== "featured")) {
    throw new Error("Bad request");
  }

  const lang = String(formData.get("lang") ?? "ko");
  await setGalleryFlag(id, flag, value);
  revalidate(lang);
}
