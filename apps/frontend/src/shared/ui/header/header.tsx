'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, MessageCircle, Menu, User, X } from 'lucide-react';
import { useMyProfileQuery } from '@/hooks/my/useProfileQuery';
import { logout } from '@/apis/auth/auth';

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
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
    closeSidebar();
    try {
      await logout();
    } finally {
      queryClient.setQueryData(['my-profile'], undefined);
      queryClient.removeQueries({ queryKey: ['my-profile-protected'] });
      router.push('/');
    }
  };

  return (
    <>
      <header className="w-screen h-20 bg-neutral-50 overflow-hidden">
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[120px] gap-3">
          {/* 로고 */}
          <Image
            src="/images/typo-default.png"
            alt="로고"
            width={128}
            height={20}
            onClick={onClickHome}
            className="cursor-pointer shrink-0 w-24 lg:w-32 h-auto"
          />
          {/* 오른쪽 메뉴 (PC) */}
          <nav className="hidden lg:inline-flex justify-start items-center gap-5">
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
          {/* 모바일 햄버거 버튼 */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="메뉴 열기"
            className="lg:hidden p-2 rounded-[10px] hover:bg-gray-100 transition-colors shrink-0"
          >
            <Menu className="w-6 h-6 text-zinc-700" />
          </button>
        </div>
      </header>

      {/* 모바일 사이드바 — header 밖에 배치하여 overflow-hidden 영향을 받지 않음 */}
      <div
        onClick={closeSidebar}
        className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-72 max-w-[80%] bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <div className="flex items-center justify-between px-5 h-20 border-b border-gray-200">
          <span className="text-b01-sb text-zinc-800">메뉴</span>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="메뉴 닫기"
            className="p-2 rounded-[10px] hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-zinc-700" />
          </button>
        </div>
        <nav className="flex flex-col py-3">
          {!isLoading && isLogged && (
            <>
              <Link
                href="/chat"
                onClick={closeSidebar}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-zinc-500" />
                <span className="text-b02-m text-zinc-700">채팅</span>
              </Link>
              <Link
                href="/my"
                onClick={closeSidebar}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-zinc-500" />
                <span className="text-b02-m text-zinc-700">마이페이지</span>
              </Link>
              <button
                type="button"
                onClick={onClickLogout}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <LogOut className="w-5 h-5 text-neutral-400" />
                <span className="text-b02-m text-neutral-500">로그아웃</span>
              </button>
            </>
          )}
          {!isLoading && !isLogged && (
            <Link
              href="/login"
              onClick={closeSidebar}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors"
            >
              <LogIn className="w-5 h-5 text-zinc-500" />
              <span className="text-b02-m text-zinc-700">로그인</span>
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
