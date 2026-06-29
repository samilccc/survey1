"use client";

import { useEffect, useMemo, useState } from "react";
import { placeholderDataUri } from "@/lib/placeholderImage";

// 16:9 대표 이미지 영역.
// 우선순위: DB image_url → public/q/0N.(png|jpg) 파일 → 콘셉트 카드(더미)
// => 실제 이미지를 쓰려면 public/q/ 폴더에 01.png ~ 10.png 만 넣으면 됩니다(DB 수정 불필요).
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
  const placeholder = useMemo(() => placeholderDataUri(order, title), [order, title]);

  const candidates = useMemo(() => {
    const nn = String(order).padStart(2, "0");
    const list: string[] = [];
    if (imageUrl && imageUrl.trim()) list.push(imageUrl.trim());
    list.push(`/q/${nn}.png`, `/q/${nn}.jpg`);
    list.push(placeholder);
    return list;
  }, [order, imageUrl, placeholder]);

  const [idx, setIdx] = useState(0);
  // 문항이 바뀌면 후보 탐색을 처음부터 다시 시작
  useEffect(() => {
    setIdx(0);
  }, [order, imageUrl]);

  const src = candidates[Math.min(idx, candidates.length - 1)];
  const isPlaceholder = src === placeholder;

  return (
    <div
      className={`relative w-full overflow-hidden ${rounded} ${className}`}
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`문항 ${order} 대표 이미지`}
        className={`absolute inset-0 h-full w-full ${
          isPlaceholder ? "object-fill" : "object-cover"
        }`}
        onError={() => setIdx((i) => Math.min(i + 1, candidates.length - 1))}
      />
    </div>
  );
}
