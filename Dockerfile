FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD661gFi59xD6kDYcbqpr4XOghQtGX9_JI
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-project-ce41f.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-project-ce41f
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-project-ce41f.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=287186253524
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:287186253524:web:98d9a50c0d48dabafa2d41
ENV NEXT_PUBLIC_APP_URL=https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app
ENV NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPz8ovSj10yHojFgCbxzhGU8DziC7xhuhW5G6RfYy2y9lcdbTUfUeufgOpSbkDlGp4rxoGX0P3L0twZKChz7A7E
ENV NEXT_PUBLIC_GA_ID=G-JQHPW3JBJP
ENV NEXT_PUBLIC_BMC_LINK=https://www.buymeacoffee.com/stayicond
ENV NEXT_PUBLIC_KAKAOPAY_LINK=https://qr.kakaopay.com/FVPcVDUAM
ENV NEXT_PUBLIC_KAKAOPAY_PREMIUM_LINK=https://qr.kakaopay.com/FVPcVDUAM

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
