'use client';

import Link from 'next/link';
import MateItem from './MateItem';
import { useRecruitmentPostsQuery } from '@/hooks/post/usePostQuery';
import { TeamDescription, Team } from '@homerunnie/shared';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

const PAGE_SIZE = 5;

export default function MateListBanner() {
  const { data, isLoading } = useRecruitmentPostsQuery({ page: 1, pageSize: PAGE_SIZE });
  const posts = data?.data ?? [];

  return (
    <div className="w-full flex flex-col gap-5 pb-20">
      <div className="flex justify-between items-end gap-3 mt-10 lg:mt-20">
        <h1 className="text-t04-sb lg:text-t02-sb">나의 직관 메이트를 찾아보세요!</h1>
        <Link
          href="/home/list"
          className="shrink-0 text-[#0ABF00] text-b03-r lg:text-b02-r hover:opacity-80 whitespace-nowrap"
        >
          전체보기
        </Link>
      </div>
      <div className="w-full rounded-2xl bg-gray-50">
        <div className="rounded-t-2xl bg-gray-100 px-5 lg:px-10 py-5">
          <div className="grid grid-cols-[1fr_70px] lg:grid-cols-[220px_120px_1fr_120px_120px_120px] items-center gap-3 lg:gap-4 text-b03-r lg:text-b02-r text-gray-600">
            <p className="hidden lg:block">경기 팀</p>
            <p className="hidden lg:block">경기일자</p>
            <p>제목</p>
            <p className="text-center">모집 상태</p>
            <p className="hidden lg:block text-right">작성자</p>
            <p className="hidden lg:block text-right">게시일자</p>
          </div>
        </div>

        {isLoading ? (
          <div className="px-10 py-5 text-gray-500 bg-white rounded-b-2xl">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="px-10 py-5 text-gray-500 bg-white rounded-b-2xl">
            등록된 모집글이 없습니다.
          </div>
        ) : (
          posts.map((item, index) => (
            <MateItem
              key={item.id}
              id={item.id}
              match={`${TeamDescription[item.teamHome as Team] ?? item.teamHome} vs ${TeamDescription[item.teamAway as Team] ?? item.teamAway}`}
              gameDate={formatDate(item.gameDate)}
              title={item.title}
              status={item.postStatus === 'CLOSE' ? '모집 완료' : '모집 중'}
              authorNickname={item.authorNickname ?? '-'}
              createdAt={formatDate(item.createdAt)}
              isLast={index === posts.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
