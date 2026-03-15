module.exports = [
"[project]/src/app/detail/[id]/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DetailLayout,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
const BASE_URL = 'https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app';
// Strip HTML tags for safe OG descriptions (defense against cached data with HTML)
function stripHtml(text) {
    return text.replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/[ ]{2,}/g, ' ').trim();
}
async function generateMetadata({ params }) {
    const { id } = await params;
    // Default fallback metadata
    const defaultMeta = {
        title: '정부 지원금 상세 정보 | 혜택알리미',
        description: '나에게 맞는 정부 지원금·복지 혜택을 혜택알리미에서 확인하세요.',
        openGraph: {
            title: '정부 지원금 상세 정보 | 혜택알리미',
            description: '나에게 맞는 정부 지원금·복지 혜택을 혜택알리미에서 확인하세요.',
            url: `${BASE_URL}/detail/${id}`,
            siteName: '혜택알리미 BenefitBell',
            type: 'article',
            images: [
                {
                    url: `${BASE_URL}/opengraph-image`,
                    width: 1200,
                    height: 630
                }
            ]
        },
        twitter: {
            card: 'summary_large_image'
        }
    };
    try {
        // 1차: 상세 API에서 제목·설명 가져오기 (servNm, overview)
        const detailRes = await fetch(`${BASE_URL}/api/benefits/${id}`, {
            next: {
                revalidate: 86400
            }
        });
        if (detailRes.ok) {
            const json = await detailRes.json();
            if (json.success && json.data) {
                const { title, ministry, overview, supportContent } = json.data;
                const ogTitle = `${title} | 혜택알리미`;
                const rawDesc = stripHtml(overview || supportContent || '나에게 맞는 정부 복지 혜택을 확인하세요.');
                // OG description은 160자 이하로
                const ogDesc = rawDesc.length > 155 ? rawDesc.slice(0, 155) + '…' : rawDesc;
                const ministryText = ministry ? ` (${ministry})` : '';
                return {
                    title: ogTitle,
                    description: ogDesc,
                    openGraph: {
                        title: ogTitle,
                        description: ogDesc,
                        url: `${BASE_URL}/detail/${id}`,
                        siteName: '혜택알리미 BenefitBell',
                        type: 'article',
                        locale: 'ko_KR',
                        images: [
                            {
                                url: `${BASE_URL}/opengraph-image`,
                                width: 1200,
                                height: 630,
                                alt: `${title}${ministryText} — 혜택알리미`
                            }
                        ]
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title: ogTitle,
                        description: ogDesc
                    },
                    alternates: {
                        canonical: `/detail/${id}`
                    }
                };
            }
        }
        // 2차: 목록 API fallback (상세 API 실패 시)
        const listRes = await fetch(`${BASE_URL}/api/benefits`, {
            next: {
                revalidate: 3600
            }
        });
        if (listRes.ok) {
            const listJson = await listRes.json();
            const benefit = (listJson.data ?? []).find((b)=>b.id === id);
            if (benefit) {
                const ogTitle = `${benefit.title} | 혜택알리미`;
                const ogDesc = `${benefit.amount ? benefit.amount + ' · ' : ''}${benefit.description ?? '정부 지원금·복지 혜택 정보를 확인하세요.'}`;
                return {
                    title: ogTitle,
                    description: ogDesc.slice(0, 155),
                    openGraph: {
                        title: ogTitle,
                        description: ogDesc.slice(0, 155),
                        url: `${BASE_URL}/detail/${id}`,
                        siteName: '혜택알리미 BenefitBell',
                        type: 'article',
                        locale: 'ko_KR',
                        images: [
                            {
                                url: `${BASE_URL}/opengraph-image`,
                                width: 1200,
                                height: 630
                            }
                        ]
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title: ogTitle,
                        description: ogDesc.slice(0, 155)
                    },
                    alternates: {
                        canonical: `/detail/${id}`
                    }
                };
            }
        }
    } catch (e) {
        console.warn('[detail layout] generateMetadata failed:', e);
    }
    return defaultMeta;
}
function DetailLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
];

//# sourceMappingURL=src_app_detail_%5Bid%5D_layout_tsx_60a0b9ae._.js.map