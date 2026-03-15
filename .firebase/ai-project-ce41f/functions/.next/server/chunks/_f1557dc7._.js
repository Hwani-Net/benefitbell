module.exports=[16603,e=>e.a(async(t,r)=>{try{var a=e.i(89171),n=e.i(67180),i=e.i(74470),s=e.i(73051),o=e.i(27817),l=t([s,o]);async function c(e,t){if(t)return{allowed:!0,remaining:999};let r=(e.headers.get("cookie")??"").match(/kakao_profile=([^;]+)/),a="ip:"+(e.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown");if(r)try{let e=JSON.parse(decodeURIComponent(r[1]));e.id&&(a="kakao:"+e.id)}catch{}let n=new Date().toISOString().slice(0,10),i=`${a.replace(/[^a-zA-Z0-9_-]/g,"_")}:${n}`;try{let e=(0,s.getAdminFirestore)().collection("ai_rate_limits").doc(i),t=await e.get(),r=t.exists?t.data()?.count??0:0;if(r>=10)return{allowed:!1,remaining:0};return await e.set({count:o.FieldValue.increment(1),date:n,updated_at:o.FieldValue.serverTimestamp()},{merge:!0}),{allowed:!0,remaining:10-r-1}}catch{return{allowed:!0,remaining:10}}}function u(e){return e.replace(/^(api-|LG-|SUB-|BIZ-|KSU-)/,"")}async function d(e){try{let t,{benefitId:r,benefitTitle:s="",lang:o="ko",isPremium:l=!1}=await e.json();if(!r)return a.NextResponse.json({error:"benefitId required"},{status:400});let{allowed:d,remaining:p}=await c(e,l);if(!d)return a.NextResponse.json({error:"오늘 AI 분석 횟수를 모두 사용했어요.",code:"RATE_LIMIT_EXCEEDED",remaining:0},{status:429});let h=(0,n.createAIClient)(),m=u(r),g=await (0,i.fetchWelfareDetail)(m),R=g&&g.servNm,f=R?g.servNm:s||r,v=R&&g.trgterIndvdl||"정보 없음",y=R&&g.slctCriteria||"정보 없음",w=R&&g.alwServCn||"정보 없음",E=R&&g.servDgst||"정보 없음",k="ko"===o?`
다음 정부 지원 혜택에 대해 분석해주세요:

제목: ${f}
대상: ${v}
선발 기준: ${y}
지원 내용: ${w}
개요: ${E}

다음 형식의 JSON으로 답해주세요:
{
  "summary": ["3줄 요약 첫번째", "3줄 요약 두번째", "3줄 요약 세번째"],
  "quickVerdict": "likely" | "partial" | "unlikely",
  "questions": [
    "자격 확인을 위한 질문 1",
    "자격 확인을 위한 질문 2",
    "자격 확인을 위한 질문 3"
  ]
}

summary는 일반인이 이해하기 쉬운 말로, quickVerdict는 이 혜택을 대부분의 사람이 받을 수 있는지 추정값입니다.
    `:`
Analyze this government benefit:

Title: ${f}
Target: ${v}
Criteria: ${y}
Support: ${w}

Respond in JSON:
{
  "summary": ["line1", "line2", "line3"],
  "quickVerdict": "likely" | "partial" | "unlikely",
  "questions": ["question1", "question2", "question3"]
}
    `,A=await (0,n.callAIWithFallback)(h,[{role:"system",content:"당신은 대한민국 정부 복지 혜택 분석 전문가입니다. 반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록(```)을 사용하지 마세요."},{role:"user",content:k}],{temperature:.3,maxTokens:800,jsonMode:!0}),N=A.replace(/```(?:json)?\s*/gi,"").replace(/```/g,"").trim().match(/\{[\s\S]*\}/);if(!N)return console.error("[ai-check] 파싱 실패 - AI 원본 응답:",A.substring(0,500)),a.NextResponse.json({error:"AI 분석 결과를 파싱할 수 없습니다."},{status:500});try{t=JSON.parse(N[0])}catch(e){return console.error("[ai-check] JSON 파싱 오류:",e,"\n원본:",N[0].substring(0,300)),a.NextResponse.json({error:"AI 분석 결과를 파싱할 수 없습니다."},{status:500})}return a.NextResponse.json({questions:t.questions??[],summary:t.summary??[],quickVerdict:t.quickVerdict??"partial",remaining:p})}catch(t){console.error("[ai-check] Error:",t);let e=t instanceof Error?t.message:String(t);if(e.includes("429")||e.toLowerCase().includes("quota")||e.includes("rate_limit"))return a.NextResponse.json({error:"AI 서비스가 일시적으로 과부하 상태입니다.",code:"AI_OVERLOADED"},{status:503});return a.NextResponse.json({error:"AI 분석 중 오류가 발생했습니다."},{status:500})}}async function p(e){try{let t,{benefitId:r,benefitTitle:s="",lang:o="ko",profile:l}=await e.json();if(!r)return a.NextResponse.json({error:"benefitId required"},{status:400});let c=(0,n.createAIClient)(),d=u(r),p=await (0,i.fetchWelfareDetail)(d),h=p&&p.servNm,m=h?p.servNm:s||r,g=h&&p.trgterIndvdl||"정보 없음",R=h&&p.slctCriteria||"정보 없음",f=h&&p.alwServCn||"정보 없음",v=h&&p.servDgst||"정보 없음",y=l&&l.age&&l.region,w=y?`
## 사용자 프로필
- 나이: ${l.age}세
- 거주지: ${l.region}
- 고용상태: ${l.employmentStatus||"미입력"}
- 소득수준: 중위소득 ${l.incomePercent||"미입력"}% 이하
- 특이사항: ${l.specialStatus?.length>0?l.specialStatus.join(", "):"없음"}
`:"",E="ko"===o?`
다음 정부 지원 혜택에 대해 ${y?"아래 사용자 프로필 기준으로 이 혜택에 해당되는지 맞춤 분석해주세요.":"일반 시민이 해당될 가능성을 상세 분석해주세요."}
사용자에게 질문하지 말고, 혜택 정보만으로 직접 판단하세요.
${w}
혜택명: ${m}
대상: ${g}
선발 기준: ${R}
지원 내용: ${f}
개요: ${v}

다음 형식의 JSON으로 답해주세요:
{
  "verdict": "likely" | "partial" | "unlikely",
  "reason": "${y?"이 사용자가":"누가"} 주로 해당되는지 쉬운 말로 2~3문장 설명",
  "details": [
    "✅ 해당되는 경우: ~한 경우",
    "⚠️ 확인 필요: ~의 조건이 있음",
    "📋 필요한 서류나 절차"
  ],
  "tips": "지금 바로 할 수 있는 행동 1가지"
}

verdict 기준:
- likely: ${y?"사용자 프로필이 대부분 조건에 부합":"대부분의 해당 계층이 받을 수 있는 보편적 혜택"}
- partial: 소득, 나이, 지역 등 특정 조건 확인이 필요
- unlikely: ${y?"사용자 프로필이 조건에 맞지 않음":"매우 제한적인 대상만 해당"}
    `:`
Analyze this government benefit and determine general eligibility.
Do NOT ask the user any questions. Judge based on the information provided.

Benefit: ${m}
Target: ${g}
Criteria: ${R}
Support: ${f}
Summary: ${v}

Respond in JSON:
{
  "verdict": "likely" | "partial" | "unlikely",
  "reason": "2-3 sentence explanation of who qualifies",
  "details": [
    "✅ Eligible if: ...",
    "⚠️ Check: ...",
    "📋 Required documents/steps"
  ],
  "tips": "1 actionable next step"
}
    `,k=await (0,n.callAIWithFallback)(c,[{role:"system",content:"당신은 대한민국 정부 복지 혜택 자격 분석 전문가입니다. 사용자에게 질문하지 말고 혜택 정보만으로 직접 판단하세요. 반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록(```)을 사용하지 마세요."},{role:"user",content:E}],{temperature:.3,maxTokens:800,jsonMode:!0}),A=k.replace(/```(?:json)?\s*/gi,"").replace(/```/g,"").trim().match(/\{[\s\S]*\}/);if(!A)return console.error("[ai-check PUT] 파싱 실패 - AI 원본 응답:",k.substring(0,500)),a.NextResponse.json({error:"AI 분석 결과를 파싱할 수 없습니다."},{status:500});try{t=JSON.parse(A[0])}catch(e){return console.error("[ai-check PUT] JSON 파싱 오류:",e,"\n원본:",A[0].substring(0,300)),a.NextResponse.json({error:"AI 분석 결과를 파싱할 수 없습니다."},{status:500})}return a.NextResponse.json({verdict:t.verdict??"partial",reason:t.reason??"",tips:t.tips??"",details:t.details??[]})}catch(t){console.error("[ai-check PUT] Error:",t);let e=t instanceof Error?t.message:String(t);if(e.includes("429")||e.toLowerCase().includes("quota")||e.includes("rate_limit"))return a.NextResponse.json({error:"AI 서비스가 일시적으로 과부하 상태입니다.",code:"AI_OVERLOADED"},{status:503});return a.NextResponse.json({error:"AI 분석 중 오류가 발생했습니다."},{status:500})}}[s,o]=l.then?(await l)():l,e.s(["POST",()=>d,"PUT",()=>p]),r()}catch(e){r(e)}},!1),91228,e=>e.a(async(t,r)=>{try{var a=e.i(47909),n=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),l=e.i(74677),c=e.i(69741),u=e.i(16795),d=e.i(87718),p=e.i(95169),h=e.i(47587),m=e.i(66012),g=e.i(70101),R=e.i(26937),f=e.i(10372),v=e.i(93695);e.i(52474);var y=e.i(220),w=e.i(16603),E=t([w]);[w]=E.then?(await E)():E;let N=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/ai-check/route",pathname:"/api/ai-check",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/ai-check/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:x,workUnitAsyncStorage:C,serverHooks:S}=N;function k(){return(0,i.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:C})}async function A(e,t,r){N.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/ai-check/route";a=a.replace(/\/index$/,"")||"/";let i=await N.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:w,params:E,nextConfig:k,parsedUrl:A,isDraftMode:x,prerenderManifest:C,routerServerContext:S,isOnDemandRevalidate:I,revalidateOnlyGenerated:$,resolvedPathname:O,clientReferenceManifest:T,serverActionsManifest:b}=i,q=(0,c.normalizeAppPath)(a),_=!!(C.dynamicRoutes[q]||C.routes[O]),P=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,A,!1):t.end("This page could not be found"),null);if(_&&!x){let e=!!C.routes[O],t=C.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(k.experimental.adapterPath)return await P();throw new v.NoFallbackError}}let j=null;!_||N.isDev||x||(j=O,j="/index"===j?"/":j);let D=!0===N.isDev||!_,U=_&&!D;b&&T&&(0,l.setManifestsSingleton)({page:a,clientReferenceManifest:T,serverActionsManifest:b});let H=e.method||"GET",M=(0,o.getTracer)(),F=M.getActiveScopeSpan(),J={params:E,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!k.experimental.authInterrupts},cacheComponents:!!k.cacheComponents,supportsDynamicResponse:D,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:k.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>N.onRequestError(e,t,a,n,S)},sharedContext:{buildId:w}},V=new u.NodeNextRequest(e),L=new u.NodeNextResponse(t),K=d.NextRequestAdapter.fromNodeNextRequest(V,(0,d.signalFromNodeResponse)(t));try{let i=async e=>N.handle(K,J).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${H} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${H} ${a}`)}),l=!!(0,s.getRequestMeta)(e,"minimalMode"),c=async s=>{var o,c;let u=async({previousCacheEntry:n})=>{try{if(!l&&I&&$&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await i(s);e.fetchMetrics=J.renderOpts.fetchMetrics;let o=J.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let c=J.renderOpts.collectedTags;if(!_)return await (0,m.sendResponse)(V,L,a,J.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(a.headers);c&&(t[f.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==J.renderOpts.collectedRevalidate&&!(J.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&J.renderOpts.collectedRevalidate,n=void 0===J.renderOpts.collectedExpire||J.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:J.renderOpts.collectedExpire;return{value:{kind:y.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await N.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:I})},!1,S),t}},d=await N.handleResponse({req:e,nextConfig:k,cacheKey:j,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:I,revalidateOnlyGenerated:$,responseGenerator:u,waitUntil:r.waitUntil,isMinimalMode:l});if(!_)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==y.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(c=d.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",I?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,g.fromNodeOutgoingHttpHeaders)(d.value.headers);return l&&_||p.delete(f.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,R.getCacheControlHeader)(d.cacheControl)),await (0,m.sendResponse)(V,L,new Response(d.value.body,{headers:p,status:d.value.status||200})),null};F?await c(F):await M.withPropagatedContext(e.headers,()=>M.trace(p.BaseServerSpan.handleRequest,{spanName:`${H} ${a}`,kind:o.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},c))}catch(t){if(t instanceof v.NoFallbackError||await N.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:I})},!1,S),_)throw t;return await (0,m.sendResponse)(V,L,new Response(null,{status:500})),null}}e.s(["handler",()=>A,"patchFetch",()=>k,"routeModule",()=>N,"serverHooks",()=>S,"workAsyncStorage",()=>x,"workUnitAsyncStorage",()=>C]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=_f1557dc7._.js.map