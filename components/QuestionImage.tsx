"use client";

import { placeholderDataUri } from "@/lib/placeholderImage";

// 16:9 대표 이미지 영역.
// image_url 이 있으면 그 이미지를, 없으면 테마 그라데이션 플레이스홀더를 보여줍니다.
export default function QuestionImage({
  order,
  title,
  imageUrl,
  className = "",
  rounded = "rounded-xl2",
}: {
  order: number;
  title: string;
  imageUrl?: string | null;
  className?: string;
  rounded?: string;
}) {
  const src = imageUrl && imageUrl.trim() ? imageUrl : placeholderDataUri(order, title);
  return (
    <div
      className={`relative w-full overflow-hidden ${rounded} ${className}`}
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`문항 ${order} 대표 이미지`}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
