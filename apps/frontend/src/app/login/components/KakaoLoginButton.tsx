'use client';

import Image from 'next/image';
import { useKakaoLogin } from '@/hooks/useKakaoLogin';

export default function KakaoLoginButton() {
  const { handleKakaoLogin } = useKakaoLogin();

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      className="w-full max-w-[516px] px-2.5 py-5 bg-[#FEE500] rounded-2xl inline-flex flex-col justify-center items-center gap-2.5 hover:brightness-95 transition cursor-pointer"
    >
      <div className="w-auto h-9 inline-flex justify-start items-center gap-4">
        <Image
          src="/icons/kakao_icon.svg"
          alt="카카오 아이콘"
          width={36}
          height={36}
          className="w-9 h-9"
        />
        <div className="justify-start text-b01-m text-stone-950">카카오톡으로 로그인하기</div>
      </div>
    </button>
  );
}
