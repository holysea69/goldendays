export type Category = "건강" | "복지" | "일자리" | "문화" | "생활";

export interface NewsItem {
  id: string;
  category: Category;
  title: string;
  summary: string;
  fullContent: string;
  content: string;       // 하위 호환 (= fullContent)
  isHtml: boolean;
  source: string;
  date: string;
  fetchedAt: number;
  readTime: string;
  emoji: string;
}

// n8n Webhook 원시 데이터 — 가능한 모든 필드 선언
export interface N8nNewsItem {
  title?: string;
  html?: string;
  subtitle?: string;
  summary?: string;
  full_content?: string;
  content?: string;
  body?: string;
  description?: string;
  category?: string;
  source?: string;
  date?: string;
  readTime?: string;
  read_time?: string;
  emoji?: string;
  link?: string;
  output?: string;
  text?: string;
  answer?: string;
  response?: string;
  result?: string;
  message?: string;
  raw?: string;
  news_list?: unknown[];
  [key: string]: unknown;
}

// 오늘 날짜 YYYY.MM.DD
export function getTodayDateStr(): string {
  const t = new Date();
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}

// 수식 패턴(= 기호) 제거 — 날짜 필드 전용
function stripFormula(v: string): string {
  if (!v.startsWith("=")) return v.trim();
  return v.replace(/^=+\s*'?/, "").replace(/'?\s*$/, "").trim();
}

// 일반 문자열 정리
function strip(v: string): string {
  return v.trim();
}

// 후보 중 첫 번째 유효 문자열
export function safe(...candidates: unknown[]): string {
  for (const v of candidates) {
    if (typeof v === "string") {
      const c = strip(v);
      if (c !== "") return c;
    }
  }
  return "";
}

// 날짜 전용 safe: 수식 패턴까지 제거
function safeDate(...candidates: unknown[]): string {
  for (const v of candidates) {
    if (typeof v === "string") {
      const c = stripFormula(v);
      if (c !== "") return c;
    }
  }
  return "";
}

// HTML 태그 제거 → 카드 요약용 평문
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 150);
}

// 제목 기반 고유 ID 생성
export function makeId(title: string, fetchedAt: number, idx = 0): string {
  const normalized = title.trim().slice(0, 60).toLowerCase().replace(/\s+/g, "-");
  return `${normalized}-${fetchedAt}-${idx}`;
}

// 문자열에서 JSON 부분만 추출
export function extractJsonFromString(raw: string): string | null {
  let t = raw.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  if (t.startsWith("{") || t.startsWith("[")) return t;
  const objStart = t.indexOf("{");
  const arrStart = t.indexOf("[");
  let start = -1;
  if (objStart !== -1 && arrStart !== -1) start = Math.min(objStart, arrStart);
  else if (objStart !== -1) start = objStart;
  else if (arrStart !== -1) start = arrStart;
  if (start === -1) return null;
  const lastObj = t.lastIndexOf("}");
  const lastArr = t.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  if (end <= start) return null;
  return t.slice(start, end + 1);
}

// JSON 문자열 안전 파싱
function tryParseJson(v: unknown): unknown {
  if (typeof v !== "string") return null;
  const extracted = extractJsonFromString(v);
  if (!extracted) return null;
  try { return JSON.parse(extracted); } catch { /* 계속 */ }
  try { return JSON.parse(extracted.replace(/\\"/g, '"')); } catch { /* 계속 */ }
  try { return JSON.parse(extracted.replace(/[\r\n\t]/g, " ")); } catch { return null; }
}

// 슈퍼 파서: JSON.parse 완전 실패 시 텍스트에서 뉴스 객체 직접 추출
export function superParseNewsItems(text: string): N8nNewsItem[] {
  const items: N8nNewsItem[] = [];
  const today = getTodayDateStr();
  const t = text.replace(/\\n/g, "\n").replace(/\\t/g, " ").replace(/\\"/g, '"');
  const blockRegex = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(t)) !== null) {
    const block = match[0];
    if (!block.includes('"title"') && !block.includes("'title'")) continue;
    const getField = (field: string): string => {
      const patterns = [
        new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "i"),
        new RegExp(`'${field}'\\s*:\\s*'([^']*)'`, "i"),
        new RegExp(`"${field}"\\s*:\\s*'([^']*)'`, "i"),
        new RegExp(`'${field}'\\s*:\\s*"([^"]*)"`, "i"),
      ];
      for (const p of patterns) {
        const m = block.match(p);
        if (m?.[1]) return m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
      }
      return "";
    };
    const title = getField("title");
    if (!title || title.length < 3) continue;
    items.push({
      title,
      summary:      getField("summary")      || getField("description") || getField("subtitle") || "",
      full_content: getField("full_content") || getField("content")     || getField("body")     || "",
      category:     getField("category") || "",
      source:       getField("source")   || "골든데이즈",
      date:         getField("date")     || today,
    });
  }
  if (items.length > 0) console.log(`[슈퍼파서] ${items.length}건`);
  return items;
}

// 오브젝트 하나에서 news_list 배열 추출
function extractNewsListFromObj(obj: Record<string, unknown>): N8nNewsItem[] | null {
  if (Array.isArray(obj.news_list) && obj.news_list.length > 0) {
    return obj.news_list as N8nNewsItem[];
  }
  if (typeof obj.news_list === "string") {
    const parsed = tryParseJson(obj.news_list);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as N8nNewsItem[];
  }
  const STR_KEYS = ["output", "text", "answer", "response", "result", "message", "content", "body", "data", "raw"];
  for (const key of STR_KEYS) {
    const val = obj[key];
    if (typeof val !== "string" || val.trim().length < 10) continue;
    let targetStr = val.trim();
    if ((targetStr.startsWith('"') && targetStr.endsWith('"')) ||
        (targetStr.startsWith("'") && targetStr.endsWith("'"))) {
      try {
        const unescaped = JSON.parse(targetStr);
        if (typeof unescaped === "string") targetStr = unescaped;
      } catch { /* 계속 */ }
    }
    const parsed = tryParseJson(targetStr);
    if (!parsed) continue;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const arr = parsed as Record<string, unknown>[];
      if (arr.some((x) => typeof x.title === "string" || typeof x.category === "string")) {
        return arr as N8nNewsItem[];
      }
    }
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      const inner = parsed as Record<string, unknown>;
      if (Array.isArray(inner.news_list) && inner.news_list.length > 0) {
        return inner.news_list as N8nNewsItem[];
      }
      if (typeof inner.news_list === "string") {
        const nl = tryParseJson(inner.news_list);
        if (Array.isArray(nl) && nl.length > 0) return nl as N8nNewsItem[];
      }
      const subList = extractNewsListFromObj(inner);
      if (subList) return subList;
    }
  }
  return null;
}

// n8n 응답 정규화 핵심 함수
export function normalizeN8nResponse(raw: unknown): N8nNewsItem[] {
  if (raw === null || raw === undefined) return [];

  // 문자열이면 재파싱
  if (typeof raw === "string") {
    const parsed = tryParseJson(raw);
    if (parsed) return normalizeN8nResponse(parsed);
    return superParseNewsItems(raw);
  }

  // 배열
  if (Array.isArray(raw)) {
    const arr = raw as Record<string, unknown>[];
    const unwrapped = arr.map((item) => {
      if (item && typeof item.json === "object" && !Array.isArray(item.json)) {
        return item.json as Record<string, unknown>;
      }
      return item;
    });

    const collected: N8nNewsItem[] = [];
    for (const item of unwrapped) {
      if (!item || typeof item !== "object") continue;
      const list = extractNewsListFromObj(item as Record<string, unknown>);
      if (list && list.length > 0) collected.push(...list);
    }
    if (collected.length > 0) return collected;

    const directArticles = unwrapped.filter(
      (item) => item && typeof item.title === "string" && (item.title as string).trim().length > 2
    ) as N8nNewsItem[];
    if (directArticles.length > 0) return directArticles;

    const withCat = unwrapped.filter(
      (item) => item && typeof item.category === "string"
    ) as N8nNewsItem[];
    if (withCat.length > 0) return withCat;

    for (const item of arr) {
      if (typeof item === "string") {
        const parsed = tryParseJson(item);
        if (parsed) {
          const sub = normalizeN8nResponse(parsed);
          if (sub.length > 0) return sub;
        }
      }
    }

    try {
      const sup = superParseNewsItems(JSON.stringify(raw));
      if (sup.length > 0) return sup;
    } catch { /* 계속 */ }
    return [];
  }

  // 오브젝트
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const list = extractNewsListFromObj(obj);
    if (list && list.length > 0) return list;

    for (const key of ["items", "data", "results", "news", "articles", "list"]) {
      if (Array.isArray(obj[key]) && (obj[key] as unknown[]).length > 0) {
        return normalizeN8nResponse(obj[key]);
      }
    }
    if (obj.json && typeof obj.json === "object") return normalizeN8nResponse(obj.json);
    if (typeof obj.title === "string" && obj.title.trim().length > 2) return [obj as N8nNewsItem];

    try {
      const sup = superParseNewsItems(JSON.stringify(obj));
      if (sup.length > 0) return sup;
    } catch { /* 계속 */ }
    return [];
  }

  return [];
}

// 카테고리 추론
export function inferCategory(raw: N8nNewsItem): Category {
  const VALID: Category[] = ["건강", "복지", "일자리", "문화", "생활"];
  const cat = safe(raw.category);
  if (VALID.includes(cat as Category)) return cat as Category;
  const bracketMatch = cat.match(/\[([^\]]+)\]/);
  if (bracketMatch) {
    const inner = bracketMatch[1].trim();
    if (VALID.includes(inner as Category)) return inner as Category;
    for (const c of VALID) if (inner.includes(c)) return c;
  }
  for (const c of VALID) if (cat.includes(c)) return c;
  const titleRaw = safe(raw.title);
  const titleBracket = titleRaw.match(/^\[([^\]]+)\]/);
  if (titleBracket) {
    const inner = titleBracket[1].trim();
    if (VALID.includes(inner as Category)) return inner as Category;
    for (const c of VALID) if (inner.includes(c)) return c;
  }
  const text = [titleRaw, safe(raw.subtitle), safe(raw.summary), safe(raw.content), safe(raw.html), safe(raw.output)].join(" ").toLowerCase();
  if (/건강|병원|치매|약|의료|운동|식단|독감|예방|영양|혈압|당뇨|암|심장|관절|재활/.test(text)) return "건강";
  if (/연금|복지|수급|지원금|혜택|노인|교통|돌봄|경로|요양|기초생활|차상위|보조|보험/.test(text)) return "복지";
  if (/일자리|취업|고용|재취업|직업|알바|시니어|노인일자리|근로|임금|채용|구인/.test(text)) return "일자리";
  if (/문화|공연|전시|여행|취미|축제|영화|음악|미술|도서|독서|강좌|여가|관광/.test(text)) return "문화";
  return "생활";
}

export function inferEmoji(category: Category): string {
  const map: Record<Category, string> = {
    건강: "💚", 복지: "💙", 일자리: "💼", 문화: "🎭", 생활: "🏠",
  };
  return map[category];
}

// n8n 원본 → NewsItem 변환 (export 필수)
export function mapN8nToNewsItem(raw: N8nNewsItem, fetchedAt: number, idx = 0): NewsItem {
  const category = inferCategory(raw);
  const aiText   = safe(raw.output, raw.answer, raw.response, raw.result, raw.message, raw.text, raw.raw);
  const title    = safe(raw.title) || "골든데이즈 최신 소식";
  const hasHtml  = typeof raw.html === "string" && raw.html.trim().length > 0;

  // full_content 직접 추출 (safe()를 거치면 내용이 손상될 수 있으므로 raw 접근)
  const rawFullContentStr = typeof raw.full_content === "string" ? raw.full_content.trim() : "";
  const hasFullContent    = rawFullContentStr.length > 0;
  const rawSummaryStr     = typeof raw.summary === "string" ? raw.summary.trim() : "";
  const hasSummary        = rawSummaryStr.length > 0;

  // summary: 카드 미리보기 + 모달 상단 파란 박스
  const summaryRaw = hasHtml
    ? stripHtml(raw.html as string)
    : hasSummary
      ? rawSummaryStr
      : safe(raw.subtitle, raw.description) || aiText || title;
  const summary = summaryRaw.slice(0, 300);

  // fullContent: 상세보기 모달 본문 전용
  const fullContent = hasFullContent
    ? rawFullContentStr
    : hasHtml
      ? (raw.html as string)
      : safe(raw.content, raw.body) || aiText || summary;

  // 날짜: 수식 패턴 제거
  const date = safeDate(raw.date) || getTodayDateStr();

  console.log(`[map] "${title.slice(0, 30)}" | summary=${summary.length}자 | fullContent=${fullContent.length}자 | date=${date}`);

  return {
    id:          makeId(title, fetchedAt, idx),
    category,
    title,
    summary,
    fullContent,
    content:     fullContent,
    isHtml:      hasHtml && !hasFullContent,
    source:      safe(raw.source) || "골든데이즈",
    date,
    fetchedAt,
    readTime:    safe(raw.readTime, raw.read_time) || "3분",
    emoji:       safe(raw.emoji) || inferEmoji(category),
  };
}
