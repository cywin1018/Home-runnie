'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyProfileQuery } from '@/hooks/my/useProfileQuery';
import { logout } from '@/apis/auth/auth';

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data, isLoading, isError } = useMyProfileQuery({
    retry: false,
  });
  const isLogged = useMemo(
    () => !isLoggingOut && !isError && Boolean(data?.nickname),
    [data?.nickname, isError, isLoggingOut],
  );

  const onClickHome = () => {
    router.push('/home');
  };

  const onClickLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      queryClient.setQueryData(['my-profile'], undefined);
      queryClient.removeQueries({ queryKey: ['my-profile-protected'] });
      router.push('/');
    }
  };

  return (
    <header className="w-screen h-20 bg-neutral-50 overflow-hidden">
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-[120px]">
        {/* 로고 */}
        <div className="w-32 h-5 hidden md:block">
          <Image
            src="/images/typo-default.png"
            alt="로고"
            width={128}
            height={20}
            onClick={onClickHome}
            className="cursor-pointer"
          />
        </div>
        {/* 모바일 로고 */}
        <div className="md:hidden">
          <Image
            src="/images/typo-default.png"
            alt="로고"
            width={128}
            height={20}
            onClick={onClickHome}
            className="cursor-pointer"
          />
        </div>
        {/* 오른쪽 메뉴 */}
        <nav className="hidden md:inline-flex justify-start items-center gap-5">
          {!isLoading && isLogged && (
            <>
              <Link href="/chat">
                <div className="px-3.5 py-2.5 rounded-[10px] flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors">
                  <div className="justify-start text-zinc-500 text-base font-medium leading-6">
                    채팅
                  </div>
                </div>
              </Link>
              <Link href="/my">
                <div className="px-3.5 py-2.5 rounded-[10px] flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors">
                  <div className="justify-start text-zinc-500 text-base font-medium leading-6">
                    마이페이지
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={onClickLogout}
                className="px-3.5 py-2.5 rounded-[10px] flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors"
              >
                <div className="justify-start text-neutral-400 text-base font-medium leading-6">
                  로그아웃
                </div>
              </button>
            </>
          )}
          {!isLoading && !isLogged && (
            <Link href="/login">
              <div className="px-3.5 py-2.5 rounded-[10px] flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors">
                <div className="justify-start text-zinc-500 text-base font-medium leading-6">
                  로그인
                </div>
              </div>
            </Link>
          )}
        </nav>
        {/* 모바일 메뉴 */}
        <nav className="md:hidden inline-flex justify-start items-center gap-3">
          {!isLoading && isLogged && (
            <>
              <Link href="/chat">
                <div className="px-3 py-2 rounded-[10px] flex justify-center items-center hover:bg-gray-100 transition-colors">
                  <div className="text-zinc-500 text-sm font-medium leading-6">채팅</div>
                </div>
              </Link>
              <Link href="/my">
                <div className="px-3 py-2 rounded-[10px] flex justify-center items-center hover:bg-gray-100 transition-colors">
                  <div className="text-zinc-500 text-sm font-medium leading-6">마이페이지</div>
                </div>
              </Link>
              <button
                type="button"
                onClick={onClickLogout}
                className="px-3 py-2 rounded-[10px] flex justify-center items-center hover:bg-gray-100 transition-colors"
              >
                <div className="text-neutral-400 text-sm font-medium leading-6">로그아웃</div>
              </button>
            </>
          )}
          {!isLoading && !isLogged && (
            <Link href="/login">
              <div className="px-3 py-2 rounded-[10px] flex justify-center items-center hover:bg-gray-100 transition-colors">
                <div className="text-zinc-500 text-sm font-medium leading-6">로그인</div>
              </div>
            </Link>
          )}
          {isLoading && (
            <div className="px-3 py-2 rounded-[10px] flex justify-center items-center">
              <div className="text-zinc-400 text-sm font-medium leading-6">확인 중...</div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
