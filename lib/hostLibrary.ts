// 진행자(발표자) 기기에만 저장되는 세션 라이브러리.
// 진행한 세션을 스택처럼 쌓아두고 나중에 하나씩 다시 열어볼 수 있게 한다.
// admin key 가 들어가므로 서버가 아닌 localStorage(해당 기기)에만 보관한다.

const KEY = "survey-host-library";

export type LibraryEntry = {
  id: string;
  key: string; // admin key
  title: string;
  createdAt: number; // 최초 생성 시각
  lastSeen: number; // 마지막으로 연 시각
};

export function loadLibrary(): LibraryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LibraryEntry[];
    if (!Array.isArray(arr)) return [];
    // 최근에 본 순으로 정렬(스택: 최신이 위)
    return arr.slice().sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  } catch {
    return [];
  }
}

function save(list: LibraryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 저장 실패는 조용히 무시 */
  }
}

// 생성/열람 시 호출. 이미 있으면 제목·키·lastSeen 갱신, 없으면 추가.
export function upsertLibrary(entry: {
  id: string;
  key: string;
  title?: string;
}): void {
  if (typeof window === "undefined" || !entry.id || !entry.key) return;
  const now = Date.now();
  const list = loadLibrary();
  const i = list.findIndex((e) => e.id === entry.id);
  if (i >= 0) {
    list[i] = {
      ...list[i],
      key: entry.key || list[i].key,
      title: entry.title || list[i].title,
      lastSeen: now,
    };
  } else {
    list.unshift({
      id: entry.id,
      key: entry.key,
      title: entry.title || "제목 없는 세션",
      createdAt: now,
      lastSeen: now,
    });
  }
  save(list);
}

export function removeFromLibrary(id: string): void {
  save(loadLibrary().filter((e) => e.id !== id));
}
