'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMyProfileProtectedQuery } from '@/hooks/my/useProfileQuery';
import { Team, TeamDescription, TeamLogoUrl } from '@homerunnie/shared';

export default function MyProfile() {
  const { data: myProfile, isLoading } = useMyProfileProtectedQuery();

  return (
    <div className="flex flex-col rounded-[20px] border p-5 lg:p-[30px] gap-[10px] bg-white shadow-md w-full mb-10 min-h-[220px] justify-center">
      {isLoading ? (
        <div className="flex items-center justify-center text-gray-400 font-medium">로딩 중...</div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between mt-0 mb-4 border-b gap-2">
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                <Image
                  src="/images/pink.png"
                  alt="유저"
                  width={68}
                  height={68}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-500">닉네임</span>
                <span className="text-lg font-semibold">{myProfile?.nickname || '-'}</span>
              </div>
            </div>
            <Link
              href="/edit-profile"
              className="text-gray-700 text-b03-r lg:text-b02-r mb-4 sm:mb-0"
            >
              프로필 수정하기
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-2 w-full">
            <div className="flex flex-col items-center gap-2">
              <p className="text-b02-r lg:text-b01 text-gray-600 font-weight-r">응원하는 팀</p>
              {myProfile?.supportTeam ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100 lg:h-[72px] lg:w-[72px]">
                    <Image
                      src={TeamLogoUrl[myProfile.supportTeam as Team]}
                      alt={TeamDescription[myProfile.supportTeam as Team]}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="font-weight-r text-b02-r lg:text-b01 leading-150">
                    {TeamDescription[myProfile.supportTeam as Team]}
                  </p>
                </div>
              ) : (
                <p className="font-weight-r text-b02-r lg:text-b01 leading-150">-</p>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-b02-r lg:text-b01 text-gray-600 font-weight-r">로그인 방법</p>
              <Image
                src="/icons/kakao_login.svg"
                alt="로그인 방법"
                width={68}
                height={68}
                className="cursor-pointer w-14 h-14 lg:w-[68px] lg:h-[68px]"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-b02-r lg:text-b01 text-gray-600 font-weight-r">누적 경고 횟수</p>
              <p className="text-t04 font-weight-r leading-140">{myProfile?.warnCount || 0}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-b02-r lg:text-b01 text-gray-600 font-weight-r">활동상태</p>
              <p className="text-t04 font-weight-r leading-140 text-main-green">
                {myProfile?.accountStatus === 'ACTIVE' ? '활동중' : '활동중지'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
