'use client';

import BannerCard from './BannerCard';
import { useMemo, useState } from 'react';
import { useMyProfileQuery } from '@/hooks/my/useProfileQuery';
import { useRouter } from 'next/navigation';
import LoginRequiredModal from '@/shared/ui/modal/LoginRequiredModal';
import { CtaButton } from '@/shared/ui/button/cta-button';

const bannerItems = [
  {
    href: '/write',
    bgColor: 'bg-[#0ABF00]',
    title: (
      <>
        새로운 직관메이트
        <br />
        모집글 작성하기
      </>
    ),
    description: '직관 메이트를 모집해보세요',
    iconSrc: '/icons/post-icon.svg',
    iconAlt: '모집글 작성 아이콘',
  },
  {
    href: '/home',
    bgColor: 'bg-[#FF6D00]',
    title: (
      <>
        직관 꿀팁
        <br />
        백과사전!
      </>
    ),
    description: '직관이 처음이신가요?',
    iconSrc: '/icons/dictionary.svg',
    iconAlt: '백과사전 아이콘',
  },
];

export default function MainBanner() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { data, isError } = useMyProfileQuery({ retry: false });
  const isLogged = useMemo(() => !isError && Boolean(data?.nickname), [data?.nickname, isError]);

  const onClickWriteBanner = () => {
    if (isLogged) {
      router.push('/write');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <div className="relative w-full h-[500px] md:h-[700px] lg:h-[909px] bg-[#FAFAFA] flex flex-col items-center overflow-hidden pt-[10%] lg:pt-[130px] px-4">
        {/* 배경 이미지 (바닥 고정, 비율에 맞춰 축소) */}
        <div className="absolute inset-0 flex justify-center items-end pointer-events-none">
          <img
            src="/bg.svg"
            alt="메인 배너"
            className="w-full max-w-[1440px] h-auto object-contain object-bottom"
          />
        </div>

        {/* 배너 텍스트  영역 */}
        <div className="z-10 flex flex-col items-center text-center">
          <h1 className="text-[#111111] text-3xl md:text-4xl lg:text-[48px] font-bold leading-[1.3] tracking-tight">
            새로운 직관메이트 모집글
            <br />
            작성하기
          </h1>
          <p className="text-[#6F7176] text-sm md:text-base lg:text-t04 font-medium mt-[12px] lg:mt-[20px]">
            직관 같이 할 친구가 필요하다면?
          </p>

          <CtaButton
            onClick={onClickWriteBanner}
            variant="primary"
            className="mt-[24px] lg:mt-[40px] w-[220px] md:w-[260px] lg:w-[320px] h-[52px] lg:h-[72px] text-sm md:text-base lg:text-t04 font-bold rounded-[12px] lg:rounded-[16px] text-white"
          >
            작성하러 가기
          </CtaButton>
        </div>
      </div>

      {/* <div className="w-full mt-[70px] flex gap-[30px]">
        {bannerItems.map((item, index) => (
          <BannerCard
            key={`${item.href}-${index}`}
            {...item}
            onClick={item.href === '/write' ? onClickWriteBanner : undefined}
          />
        ))}
      </div> */}

      <LoginRequiredModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        title="로그인이 필요합니다"
        description="모집글 작성은 로그인 후 이용할 수 있어요."
        confirmText="로그인 하러가기"
        onConfirm={() => {
          setIsLoginModalOpen(false);
          router.push('/login');
        }}
      />
    </>
  );
}
