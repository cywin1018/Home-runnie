'use client';

import { useRecruitmentPostsQuery } from '@/hooks/post/usePostQuery';
import MateItem from '@/app/home/components/MateItem';

const formatGameDate = (gameDate: string) => {
  const date = new Date(gameDate);
  if (Number.isNaN(date.getTime())) return '-';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

export default function RecruitmentListPage() {
  const { data, isLoading } = useRecruitmentPostsQuery(1, 50);
  const posts = data?.data ?? [];

  return (
    <div className="py-10">
      <h1 className="text-t02-sb mb-6">전체 모집글</h1>

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
