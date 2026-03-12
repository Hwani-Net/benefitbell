import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// 유저 프로필 로드 (GET /api/user/profile?kakaoId=xxx)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const kakaoId = searchParams.get('kakaoId')
    if (!kakaoId) {
      return NextResponse.json({ error: 'kakaoId 필수' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const userDoc = await db.collection('users').doc(String(kakaoId)).get()

    if (!userDoc.exists) {
      return NextResponse.json({ data: null })
    }

    const data = userDoc.data()!
    return NextResponse.json({
      data: {
        // Step 1: 기본 프로필
        name: data.name ?? data.nickname ?? '',
        birthYear: data.birthYear ?? null,
        gender: data.gender ?? null,
        region: data.region ?? null,
        householdSize: data.householdSize ?? null,
        incomePercent: data.incomePercent ?? null,
        housingType: data.housingType ?? null,
        employmentStatus: data.employmentStatus ?? null,
        // Step 2: 가족
        maritalStatus: data.maritalStatus ?? null,
        hasChildren: data.hasChildren ?? null,
        childrenCount: data.childrenCount ?? null,
        childrenAgeGroup: data.childrenAgeGroup ?? [],
        isPregnant: data.isPregnant ?? null,
        // Step 3: 상세
        isBasicLivingRecipient: data.isBasicLivingRecipient ?? null,
        healthInsuranceType: data.healthInsuranceType ?? null,
        disabilityGrade: data.disabilityGrade ?? null,
        specialStatus: data.specialStatus ?? [],
        // Step 4: 사업자
        isBusinessOwner: data.isBusinessOwner ?? null,
        businessType: data.businessType ?? null,
        businessAge: data.businessAge ?? null,
        annualRevenue: data.annualRevenue ?? null,
        employeeCount: data.employeeCount ?? null,
        industryType: data.industryType ?? null,
        // 시스템
        kakaoAlerts: data.kakaoAlerts ?? true,
        alertDays: data.alertDays ?? [7, 3],
        isPremium: data.is_premium ?? false,
        // 개인화 데이터
        bookmarks: data.bookmarks ?? [],
        categories: data.categories ?? [],
      },
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[user/profile GET] Error:', errMsg, err)
    return NextResponse.json({ error: '로드 실패', detail: errMsg }, { status: 500 })
  }
}

// 유저 프로필 저장 (Firestore users 컬렉션) — 전체 프로필 + 개인화 데이터
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { kakaoId } = body
    if (!kakaoId) {
      return NextResponse.json({ error: 'kakaoId 필수' }, { status: 400 })
    }

    const db = getAdminFirestore()

    // 저장할 데이터 구성 (undefined 필드는 제외)
    const updateData: Record<string, unknown> = {
      kakao_id: kakaoId,
      updated_at: FieldValue.serverTimestamp(),
    }

    // Step 1: 기본 프로필
    if (body.nickname !== undefined) updateData.nickname = body.nickname
    if (body.name !== undefined) updateData.name = body.name
    if (body.birthYear !== undefined) updateData.birthYear = body.birthYear
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.region !== undefined) updateData.region = body.region
    if (body.householdSize !== undefined) updateData.householdSize = body.householdSize
    if (body.incomePercent !== undefined) updateData.incomePercent = body.incomePercent
    if (body.housingType !== undefined) updateData.housingType = body.housingType
    if (body.employmentStatus !== undefined) updateData.employmentStatus = body.employmentStatus
    if (body.specialStatus !== undefined) updateData.specialStatus = body.specialStatus
    // Step 2: 가족
    if (body.maritalStatus !== undefined) updateData.maritalStatus = body.maritalStatus
    if (body.hasChildren !== undefined) updateData.hasChildren = body.hasChildren
    if (body.childrenCount !== undefined) updateData.childrenCount = body.childrenCount
    if (body.childrenAgeGroup !== undefined) updateData.childrenAgeGroup = body.childrenAgeGroup
    if (body.isPregnant !== undefined) updateData.isPregnant = body.isPregnant
    // Step 3: 상세
    if (body.isBasicLivingRecipient !== undefined) updateData.isBasicLivingRecipient = body.isBasicLivingRecipient
    if (body.healthInsuranceType !== undefined) updateData.healthInsuranceType = body.healthInsuranceType
    if (body.disabilityGrade !== undefined) updateData.disabilityGrade = body.disabilityGrade
    // Step 4: 사업자
    if (body.isBusinessOwner !== undefined) updateData.isBusinessOwner = body.isBusinessOwner
    if (body.businessType !== undefined) updateData.businessType = body.businessType
    if (body.businessAge !== undefined) updateData.businessAge = body.businessAge
    if (body.annualRevenue !== undefined) updateData.annualRevenue = body.annualRevenue
    if (body.employeeCount !== undefined) updateData.employeeCount = body.employeeCount
    if (body.industryType !== undefined) updateData.industryType = body.industryType
    // 시스템
    if (body.kakaoAlerts !== undefined) updateData.kakaoAlerts = body.kakaoAlerts
    if (body.alertDays !== undefined) updateData.alertDays = body.alertDays

    // 개인화 데이터
    if (body.categories !== undefined) updateData.categories = body.categories
    if (body.bookmarks !== undefined) updateData.bookmarks = body.bookmarks

    // age_group도 호환성 유지
    if (body.age_group !== undefined) updateData.age_group = body.age_group

    await db.collection('users').doc(String(kakaoId)).set(updateData, { merge: true })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[user/profile] Error:', err)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
