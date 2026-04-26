"use client";
import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { useApp } from "@/lib/context";
import {
  getDDayColor,
  getDDayText,
  CATEGORY_INFO,
  bText,
} from "@/data/benefits";
import { getPersonalizedBenefits } from "@/lib/recommendation";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import AdBanner from "@/components/ads/AdBanner";

type SortType = "popular" | "deadline" | "new";

const SearchFieldIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function SearchContent() {
  const {
    t,
    lang,
    toggleBookmark,
    isBookmarked,
    kakaoUser,
    userProfile,
    benefits,
    benefitsLoading: loading,
  } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL 쿼리 파라미터로 상태 관리 → 조건 선택 시 router.push() → 뒤로가기 시 /search 초기화면 복귀
  const query = searchParams.get("q") ?? "";
  const catKey = searchParams.get("cat") ?? searchParams.get("category") ?? "";
  const customKey = searchParams.get("custom") ?? "";
  const sort = (searchParams.get("sort") as SortType) ?? "popular";

  const [inputValue, setInputValue] = useState(query);
  const [sharedId, setSharedId] = useState<string | null>(null);

  // Web Share API (web-share 스킬 준수)
  const handleShare = useCallback(
    async (benefitId: string, title: string) => {
      const url = `${window.location.origin}/detail/${benefitId}`;
      const text =
        lang === "ko"
          ? `💡 ${title} — 혜택알리미에서 확인하세요!`
          : `💡 ${title} — Check on BenefitBell!`;
      const copyToClipboard = async (): Promise<boolean> => {
        let copied = false;
        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(url);
            copied = true;
          } catch (clipErr) {
            // Clipboard API 권한 거부 또는 비보안 컨텍스트 — execCommand fallback으로 진행
            console.error(
              "[share] clipboard.writeText failed, trying execCommand:",
              clipErr,
            );
          }
        }
        if (!copied) {
          const el = document.createElement("textarea");
          el.value = url;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.select();
          try {
            copied = document.execCommand("copy");
          } catch (execErr) {
            // execCommand도 미지원 환경 (Firefox 최신, iOS Safari 등) — 복사 불가로 처리
            console.error("[share] execCommand copy failed:", execErr);
          }
          document.body.removeChild(el);
        }
        return copied;
      };

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          setSharedId(benefitId);
          setTimeout(() => setSharedId(null), 2500);
        } catch (err) {
          // AbortError는 사용자가 공유 다이얼로그를 닫은 정상 케이스 — 무시
          // 그 외 에러는 clipboard fallback + 콘솔 기록 (silent fail 금지)
          const errName = (err as { name?: string })?.name;
          if (errName !== "AbortError") {
            console.error("[share] navigator.share failed:", err);
            const copied = await copyToClipboard();
            if (copied) {
              setSharedId(benefitId);
              setTimeout(() => setSharedId(null), 2500);
            }
          }
        }
      } else {
        const copied = await copyToClipboard();
        if (copied) {
          setSharedId(benefitId);
          setTimeout(() => setSharedId(null), 2500);
        }
      }
    },
    [lang],
  );

  const recentSearches =
    lang === "ko"
      ? ["기초연금 신청", "서울시 청년지원", "차상위 의료비"]
      : [
          "Basic pension application",
          "Seoul youth support",
          "Near-poverty medical expenses",
        ];
  const recommendedTags =
    lang === "ko"
      ? ["#청년월세", "#기초수급", "#K패스", "#부모급여", "#도약계좌"]
      : [
          "#YouthRent",
          "#BasicLiving",
          "#KPass",
          "#ParentalPay",
          "#LeapAccount",
        ];
  const categories = Object.entries(CATEGORY_INFO);

  // URL 파라미터 변경 시 inputValue 동기화
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // 검색어 선택 → URL push
  const applyQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (sort !== "popular") params.set("sort", sort);
      router.push(`/search${params.toString() ? "?" + params.toString() : ""}`);
    },
    [router, sort],
  );

  // 카테고리 키 선택 → URL push (?cat=basic-living)
  const applyCategory = useCallback(
    (key: string) => {
      const params = new URLSearchParams();
      if (key) params.set("cat", key);
      if (sort !== "popular") params.set("sort", sort);
      router.push(`/search?${params.toString()}`);
    },
    [router, sort],
  );

  // 정렬 변경 → replace (히스토리 불필요)
  const applySort = useCallback(
    (s: SortType) => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (catKey) params.set("cat", catKey);
      if (customKey) params.set("custom", customKey);
      if (s !== "popular") params.set("sort", s);
      router.replace(`/search?${params.toString()}`);
    },
    [router, query, catKey, customKey],
  );

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyQuery(inputValue);
  };

  // PP-Quick Win 1: Fuse.js fuzzy 검색 — 오타·띄어쓰기 보정
  // threshold 0.4 = 40% 거리까지 허용 ("기초 연금" → "기초연금" 매칭)
  const baseList = useMemo(
    () =>
      customKey === "true" && kakaoUser
        ? getPersonalizedBenefits(benefits, userProfile)
        : benefits,
    [customKey, kakaoUser, benefits, userProfile],
  );

  const fuse = useMemo(
    () =>
      new Fuse(baseList, {
        keys: [
          { name: "title", weight: 2 },
          { name: "titleEn", weight: 1 },
          { name: "categoryLabel", weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [baseList],
  );

  const filtered = useMemo(() => {
    const queryMatched =
      query === "" ? baseList : fuse.search(query).map((r) => r.item);
    return queryMatched
      .filter((b) => catKey === "" || b.category === catKey)
      .sort((a, b) => {
        if (sort === "deadline") return a.dDay - b.dDay;
        if (sort === "new") return (b.new ? 1 : 0) - (a.new ? 1 : 0);
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      });
  }, [baseList, fuse, query, catKey, sort]);

  return (
    <>
      <TopBar />
      <main className="page-content">
        {/* 검색바 */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <SearchFieldIcon />
            <input
              className={styles.searchInput}
              placeholder={t.searchPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputSubmit}
              onBlur={() => {
                if (inputValue !== query) applyQuery(inputValue);
              }}
            />
            {inputValue && (
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 4px",
                  color: "var(--text-tertiary)",
                }}
                onClick={() => {
                  setInputValue("");
                  applyQuery("");
                }}
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {query === "" && catKey === "" && customKey === "" ? (
          <>
            {kakaoUser && (
              <section className="section" style={{ marginBottom: 12 }}>
                <button
                  style={{
                    width: "100%",
                    padding: "20px 16px",
                    background: "var(--gradient-coral)",
                    borderRadius: 16,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.2)",
                  }}
                  onClick={() => router.push("/search?custom=true")}
                >
                  <span style={{ fontSize: 28 }}>✨</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "white" }}>
                      {lang === "ko"
                        ? `${kakaoUser.nickname}님 맞춤 혜택 모아보기`
                        : `Personalized benefits for ${kakaoUser.nickname}`}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 13,
                        fontWeight: 400,
                        marginTop: 4,
                      }}
                    >
                      {lang === "ko"
                        ? "저장된 정보를 기반으로 딱 맞는 혜택을 찾아드려요!"
                        : "Find benefits perfectly matched to your saved profile!"}
                    </div>
                  </div>
                  <span style={{ color: "white" }}>→</span>
                </button>
              </section>
            )}

            {/* 💎 프리미엄 업그레이드 배너 (비프리미엄 유저 전용) */}
            {!userProfile?.isPremium && (
              <section className="section" style={{ marginBottom: 8 }}>
                <Link
                  href="/premium"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)",
                      borderRadius: 16,
                      padding: "14px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      boxShadow: "0 4px 15px rgba(124, 58, 237, 0.25)",
                    }}
                  >
                    <span style={{ fontSize: 26, flexShrink: 0 }}>👑</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {lang === "ko"
                          ? "프리미엄으로 업그레이드"
                          : "Upgrade to Premium"}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.85)",
                          marginTop: 2,
                        }}
                      >
                        {lang === "ko"
                          ? "AI 무제한 + 광고 제거 + 14일 전 알림 — 월 4,900원"
                          : "Unlimited AI + No ads + 14-day alerts — ₩4,900/mo"}
                      </div>
                    </div>
                    <span
                      style={{ color: "rgba(255,255,255,0.9)", fontSize: 18 }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {/* 카테고리 그리드 */}

            <section className="section">
              <h2 className="section-title mb-12">{t.searchByCategory}</h2>
              <div className={styles.catGrid}>
                {categories.map(([key, cat]) => (
                  <button
                    key={key}
                    className={styles.catItem}
                    onClick={() => applyCategory(key)}
                  >
                    <span className={styles.catEmoji}>{cat.icon}</span>
                    <span className={styles.catLabel}>
                      {lang === "ko" ? cat.label : cat.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* 추천 태그 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.recommendedTags}</h2>
              <div className={styles.tagRow}>
                {recommendedTags.map((tag) => (
                  <button
                    key={tag}
                    className={styles.tag}
                    onClick={() => applyQuery(tag.replace("#", ""))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* 💡 AI 상담 유도 배너 */}
            <section className="section" style={{ marginBottom: 8 }}>
              <Link
                href="/ai"
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                  }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>💡</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 14, fontWeight: 700, color: "white" }}
                    >
                      {lang === "ko"
                        ? "원하는 혜택을 말로 물어보세요"
                        : "Describe the benefit you want"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.85)",
                        marginTop: 2,
                      }}
                    >
                      {lang === "ko"
                        ? "AI가 상황을 듣고 딱 맞는 혜택을 찾아드려요"
                        : "AI will find the right benefits based on your situation"}
                    </div>
                  </div>
                  <span
                    style={{ color: "rgba(255,255,255,0.9)", fontSize: 18 }}
                  >
                    →
                  </span>
                </div>
              </Link>
            </section>

            {/* 최근 검색어 */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">{t.recentSearches}</h2>
                <button className="section-link">{t.clearAll}</button>
              </div>
              <ul className={styles.recentList}>
                {recentSearches.map((s) => (
                  <li
                    key={s}
                    className={styles.recentItem}
                    onClick={() => applyQuery(s)}
                  >
                    <span className={styles.recentIcon}>🕐</span>
                    <span className={styles.recentText}>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <>
            {/* 카테고리 필터 헤더 (catKey 선택 시) */}
            {customKey === "true" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px 4px",
                }}
              >
                <span style={{ fontSize: 20 }}>✨</span>
                <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>
                  {lang === "ko"
                    ? "맞춤 혜택 추천 결과"
                    : "Personalized Results"}
                </strong>
                <button
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "var(--text-tertiary)",
                  }}
                  onClick={() => router.push("/search")}
                  aria-label="필터 초기화"
                >
                  ✕
                </button>
              </div>
            ) : catKey &&
              CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO] ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px 4px",
                }}
              >
                <span style={{ fontSize: 20 }}>
                  {CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO].icon}
                </span>
                <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>
                  {lang === "ko"
                    ? CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO].label
                    : CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO]
                        .labelEn}
                </strong>
                <button
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "var(--text-tertiary)",
                  }}
                  onClick={() => router.push("/search")}
                  aria-label="카테고리 필터 초기화"
                >
                  ✕
                </button>
              </div>
            ) : null}
            {/* 정렬 필터 탭 */}
            <div
              className={`scroll-x ${styles.sortRow}`}
              style={{ padding: "0 16px 12px" }}
            >
              {[
                { key: "popular", label: t.sortByPopular },
                { key: "deadline", label: t.sortByDeadline },
                { key: "new", label: t.sortByNew },
              ].map((s) => (
                <button
                  key={s.key}
                  className={`chip ${sort === s.key ? "active" : ""}`}
                  onClick={() => applySort(s.key as SortType)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* 결과 리스트 */}
            <section className="section">
              {loading ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {lang === "ko" ? "불러오는 중..." : "Loading..."}
                </p>
              ) : (
                <>
                  <p className={styles.resultCount}>
                    {lang === "ko"
                      ? `${filtered.length}건`
                      : `${filtered.length} results`}
                  </p>
                  <div className={styles.resultList}>
                    {filtered.map((b) => (
                      <Link
                        key={b.id}
                        href={`/detail/${b.id}`}
                        className={`${styles.resultItem} animate-fade-in`}
                      >
                        <div className={styles.resultLeft}>
                          <div className={styles.resultMeta}>
                            <span className="badge badge-coral-soft">
                              {bText(b, "categoryLabel", lang)}
                            </span>
                            {b.dDay >= 0 && b.dDay <= 14 && (
                              <span className={`badge ${getDDayColor(b.dDay)}`}>
                                {getDDayText(
                                  b.dDay,
                                  lang === "ko" ? "ko" : "en",
                                )}
                              </span>
                            )}
                            {b.new && (
                              <span className="badge badge-coral text-xs">
                                {t.newBadge}
                              </span>
                            )}
                          </div>
                          <h3 className={styles.resultTitle}>
                            {bText(b, "title", lang)}
                          </h3>
                          <p className={styles.resultAmount}>
                            {bText(b, "amount", lang)}
                          </p>
                          <p className={styles.resultPeriod}>
                            {b.dDay >= 365 ||
                            !b.applicationEnd ||
                            b.applicationEnd === "상시" ||
                            b.applicationEnd === "별도공지"
                              ? `📅 ${lang === "ko" ? "상시 모집" : "Always Open"}`
                              : `📅 ${b.applicationStart || ""} ~ ${b.applicationEnd}`}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            alignItems: "center",
                          }}
                        >
                          <button
                            className={styles.resultBookmark}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleBookmark(b.id);
                            }}
                          >
                            {isBookmarked(b.id) ? "❤️" : "🤍"}
                          </button>
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 14,
                              color:
                                sharedId === b.id
                                  ? "#10b981"
                                  : "var(--text-tertiary)",
                              padding: "2px 4px",
                              borderRadius: 6,
                              transition: "color 0.2s",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleShare(b.id, bText(b, "title", lang));
                            }}
                            aria-label={lang === "ko" ? "공유" : "Share"}
                          >
                            {sharedId === b.id ? "✅" : "📤"}
                          </button>
                        </div>
                      </Link>
                    ))}
                    {filtered.length === 0 && (
                      <div className={styles.emptyState}>
                        <span style={{ fontSize: 40 }}>🔍</span>
                        <p>
                          {lang === "ko"
                            ? "검색 결과가 없습니다"
                            : "No results found"}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </>
        )}

        {/* Google AdSense 광고 */}
        <section className="section">
          <AdBanner slot="5754258932" format="auto" style={{ minHeight: 90 }} />
        </section>
      </main>
      <BottomNav />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
