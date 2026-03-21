'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useScrappedRecruitmentsQuery } from '@/hooks/my/useScrappedRecruitmentsQuery';
import { useWrittenRecruitmentsQuery } from '@/hooks/my/useWrittenRecruitmentsQuery';
import { useParticipatedRecruitmentsQuery } from '@/hooks/my/useParticipatedRecruitmentsQuery';
import { RecruitmentSummaryResponse } from '@homerunnie/shared';

type ContentType = 'scrapped' | 'written' | 'participated' | null;

export default function MyContents() {
  const [selected, setSelected] = useState<ContentType>(null);
  const [page, setPage] = useState(1);

  const scrapped = useScrappedRecruitmentsQuery(page, { enabled: selected === 'scrapped' });
  const written = useWrittenRecruitmentsQuery(page, { enabled: selected === 'written' });
  const participated = useParticipatedRecruitmentsQuery(page, {
    enabled: selected === 'participated',
  });

  const handleSelect = (type: ContentType) => {
    if (selected === type) {
      setSelected(null);
    } else {
      setSelected(type);
      setPage(1);
    }
  };

  const getQueryResult = () => {
    switch (selected) {
      case 'scrapped':
        return scrapped;
      case 'written':
        return written;
      case 'participated':
        return participated;
      default:
        return null;
    }
  };

  const result = getQueryResult();
  const items = result?.data?.data ?? [];
  const totalPage = result?.data?.totalPage ?? 1;

  return (
    <div className="flex flex-col rounded-[20px] border py-[30px] px-[6px] gap-[10px] bg-white shadow-md w-full mb-10">
      <div
        className={`flex flex-row gap-3 py-[4px] px-[30px] hover:bg-gray-50 cursor-pointer rounded-lg ${selected === 'scrapped' ? 'bg-gray-100' : ''}`}
        onClick={() => handleSelect('scrapped')}
      >
        <Image src="/icons/bookmark.svg" alt="스크랩 한 모집글" width={30} height={30} />
        <p className="font-weight-m text-b01 leading-150">스크랩 한 모집글</p>
      </div>

      <div
        className={`flex flex-row gap-3 py-[4px] px-[30px] hover:bg-gray-50 cursor-pointer rounded-lg ${selected === 'written' ? 'bg-gray-100' : ''}`}
        onClick={() => handleSelect('written')}
      >
        <Image src="/icons/pen.svg" alt="내가 작성한 모집글" width={30} height={30} />
        <p className="font-weight-m text-b01 leading-150">내가 작성한 모집글</p>
      </div>

      <div
        className={`flex flex-row gap-3 py-[4px] px-[30px] hover:bg-gray-50 cursor-pointer rounded-lg ${selected === 'participated' ? 'bg-gray-100' : ''}`}
        onClick={() => handleSelect('participated')}
      >
        <Image src="/images/default.png" alt="내가 참여한 글" width={30} height={30} />
        <p className="font-weight-m text-b01 leading-150">내가 참여한 글</p>
      </div>

      {selected && (
        <div className="mt-2 px-[24px]">
          {result?.isLoading && (
            <p className="text-gray-500 text-b02-r py-4 text-center">불러오는 중...</p>
          )}

          {!result?.isLoading && items.length === 0 && (
            <p className="text-gray-500 text-b02-r py-4 text-center">목록이 없습니다.</p>
          )}

          {!result?.isLoading && items.length > 0 && (
            <>
              <div className="flex flex-col divide-y">
                {items.map((item: RecruitmentSummaryResponse) => (
                  <Link
                    key={item.number}
                    href={`/home/${item.number}`}
                    className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-b02-r text-gray-500 w-[100px] truncate">
                        {item.gameTeams}
                      </span>
                      <span className="text-b02-m truncate">{item.title}</span>
                    </div>
                    <span
                      className={`text-b03-r ${item.recruitmentStatus === 'RECRUITING' ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {item.recruitmentStatus === 'RECRUITING' ? '모집중' : '마감'}
                    </span>
                  </Link>
                ))}
              </div>

              {totalPage > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    className="px-3 py-1 text-b03-r rounded border disabled:opacity-30"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    이전
                  </button>
                  <span className="px-3 py-1 text-b03-r">
                    {page} / {totalPage}
                  </span>
                  <button
                    className="px-3 py-1 text-b03-r rounded border disabled:opacity-30"
                    disabled={page >= totalPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
