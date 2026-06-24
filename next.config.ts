import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 갤러리 이미지 업로드(서버 액션)는 원본 파일을 받으므로 기본 1MB 한도를 높입니다.
    // 업로드 후 서버에서 sharp 로 압축해 DB 에 저장합니다.
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
