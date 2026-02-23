-- ============================================================
-- 혜택알리미 Phase 3: Supabase DB 스키마
-- Supabase SQL Editor에서 한 번 실행하세요.
-- ============================================================

-- 1. Web Push 구독자 테이블
create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  endpoint    text unique not null,
  p256dh      text not null,
  auth        text not null,
  categories  text[] default '{}',
  age_group   text,
  region      text,
  created_at  timestamptz default now()
);

-- endpoint 기반 빠른 조회 인덱스
create index if not exists push_subscriptions_endpoint_idx
  on push_subscriptions(endpoint);

-- categories 배열 GIN 인덱스 (매칭 연산 최적화)
create index if not exists push_subscriptions_categories_idx
  on push_subscriptions using gin(categories);

-- RLS: 서버(service role)만 읽기/쓰기, 클라이언트 upsert만 허용
alter table push_subscriptions enable row level security;

create policy "allow_insert_own_subscription"
  on push_subscriptions for insert
  with check (true);

create policy "allow_update_own_subscription"
  on push_subscriptions for update
  using (true);

-- 2. 유저 파이플 테이블 (카카오 로그인 시 연동)
create table if not exists user_profiles (
  id          uuid primary key default gen_random_uuid(),
  kakao_id    text unique not null,
  nickname    text,
  categories  text[] default '{}',
  age_group   text,
  region      text,
  is_premium  boolean default false,
  updated_at  timestamptz default now()
);

-- 기존 테이블이 이미 있을 경우 is_premium 컬럼 추가 (안전 장치)
alter table user_profiles add column if not exists is_premium boolean default false;


create index if not exists user_profiles_kakao_id_idx
  on user_profiles(kakao_id);

alter table user_profiles enable row level security;

create policy "allow_upsert_own_profile"
  on user_profiles for all
  using (true)
  with check (true);
