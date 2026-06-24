import { getGalleryImage } from "@/lib/gallery";

export const runtime = "nodejs";

/**
 * 갤러리 이미지 바이트를 스트리밍합니다. URL 에 `?v=<updatedAt>` 을 붙여 호출하므로
 * 내용이 바뀌면 v 가 달라져 캐시가 자연스럽게 무효화됩니다 → immutable 캐시 안전.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const img = await getGalleryImage(n);
  if (!img) return new Response("Not found", { status: 404 });

  return new Response(img.data as BodyInit, {
    headers: {
      "Content-Type": img.mime,
      "Content-Length": String(img.data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
