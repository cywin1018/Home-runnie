'use client';

import Link from 'next/link';
import MateItem from './MateItem';
import { useRecruitmentPostsQuery } from '@/hooks/post/usePostQuery';

const formatGameDate = (gameDate: string) => {
  const date = new Date(gameDate);
  if (Number.isNaN(date.getTime())) return '-';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

export default function MateListBanner() {
  const { data, isLoading } = useRecruitmentPostsQuery(1, 5);
  const posts = data?.data ?? [];

  return (
    <div className="w-full flex flex-col gap-[20px]">
      <div className="flex justify-between">
        <h1 className="mt-[80px] text-t02-sb">나의 직관 메이트를 찾아보세요!</h1>
        <Link href="/home/list" className="text-[#0ABF00] mt-[16px] text-b02-r hover:opacity-80">
          전체보기
        </Link>
      </div>
      <div className="w-full flex flex-col">
        <div className="bg-gray-100 px-[40px] py-[20px] rounded-t-2xl">
          <div className="flex justify-between text-b02-r text-gray-600">
            <div className="flex items-center gap-10">
              <p className="w-[120px]">경기</p>
              <p>제목</p>
            </div>
            <p>경기 날짜</p>
          </div>
        </div>
        {isLoading && (
          <div className="px-[40px] py-[20px] bg-white text-gray-500">불러오는 중...</div>
        )}
        {!isLoading &&
          posts.map((item, index) => (
            <MateItem
              key={item.id}
              id={item.id}
              match={`${item.teamHome} vs ${item.teamAway}`}
              title={item.title}
              date={formatGameDate(item.gameDate)}
              isLast={index === posts.length - 1}
            />
          ))}
        {!isLoading && posts.length === 0 && (
          <div className="px-[40px] py-[20px] bg-white rounded-b-2xl text-gray-500">
            등록된 모집글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
