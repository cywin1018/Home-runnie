'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecruitmentPostsQuery } from '@/hooks/post/usePostQuery';
import type { RecruitmentPostItemResponse } from '@/apis/post/post';
import { CtaButton } from '@/shared/ui/button/cta-button';
import DateSelect from '@/shared/ui/write/date-select';
import TeamDropdown from '@/shared/ui/dropdown/team-dropdown';
import { RadioGroup } from '@/shared/ui/radio';
import PickedTagsField from '@/app/write/components/picked-tags-field';
import {
  TeamDescription,
  Team,
  Stadium,
  baseBallTeamItems,
  baseBallStadiumItems,
} from '@homerunnie/shared';

const formatGameDate = (gameDate: string) => {
  const date = new Date(gameDate);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
};

type RowStatus = '모집 중' | '모집 완료';
type InfoTab = 'game' | 'recruit' | 'author';

const getStatusFromItem = (item: unknown): RowStatus => {
  const postStatus = (item as { postStatus?: string })?.postStatus;
  return postStatus === 'CLOSE' ? '모집 완료' : '모집 중';
};

export default function RecruitmentListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab | null>('game');
  const [gameDate, setGameDate] = useState<Date | null>(null);
  const [stadium, setStadium] = useState<Stadium | ''>('');
  const [matchTeam, setMatchTeam] = useState<Team | ''>('');
  const [headcount, setHeadcount] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'have' | 'need' | ''>('');
  const [favTeam, setFavTeam] = useState<Team | ''>('');
  const [picked, setPicked] = useState<string[]>([]);
  const pageSize = 6;
  const filters = useMemo(
    () => ({
      page,
      pageSize,
      gameDate: gameDate?.toISOString(),
      stadium: stadium || undefined,
      teamA: matchTeam || undefined,
      headcount: headcount.trim() || undefined,
      ticketStatus: ticketStatus || undefined,
      favTeam: favTeam || undefined,
      picked: picked.length > 0 ? picked : undefined,
    }),
    [page, pageSize, gameDate, stadium, matchTeam, headcount, ticketStatus, favTeam, picked],
  );
  const { data, isLoading } = useRecruitmentPostsQuery(filters);
  const posts: RecruitmentPostItemResponse[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const listLoading = isLoading;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);
    const adjustedStart = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [gameDate, stadium, matchTeam, headcount, ticketStatus, favTeam, picked]);

  return (
    <main className="w-full pb-12 lg:pb-24">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 lg:gap-16 pt-8 lg:pt-16">
        <div className="w-full space-y-5 lg:space-y-7">
          <h1 className="text-2xl lg:text-4xl font-bold leading-tight lg:leading-[54.4px] text-stone-950">
            직관 메이트 구하기
          </h1>

          <div className="rounded-[20px] bg-neutral-50 p-4 lg:p-7">
            <div className="flex items-center gap-1 lg:gap-2.5 overflow-x-auto">
              {(['game', 'recruit', 'author'] as const).map((tab) => (
                <CtaButton
                  key={tab}
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setActiveInfoTab((prev) => (prev === tab ? null : tab))}
                  className={`h-auto rounded-none border-0 px-3 lg:px-5 py-2 lg:py-3.5 text-sm lg:text-xl font-semibold leading-6 lg:leading-7 shadow-none shrink-0 ${
                    activeInfoTab === tab
                      ? 'border-b border-stone-950 text-stone-950 hover:bg-transparent'
                      : 'text-neutral-400 hover:bg-transparent'
                  }`}
                >
                  {{ game: '경기정보', recruit: '모집 정보', author: '작성자 정보' }[tab]}
                </CtaButton>
              ))}
            </div>

            <div className="mt-5 lg:mt-7">
              {activeInfoTab === 'game' && (
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 lg:gap-9">
                  <DateSelect
                    value={gameDate}
                    onChange={setGameDate}
                    placeholder="경기 날짜 선택"
                    className="w-full"
                  />
                  <TeamDropdown
                    items={baseBallStadiumItems}
                    placeholder="경기하는 구장을 선택해주세요"
                    value={stadium || null}
                    onChange={(next) => setStadium(next as Stadium)}
                    className="w-full"
                  />
                  <TeamDropdown
                    items={baseBallTeamItems}
                    placeholder="팀 선택"
                    value={matchTeam || null}
                    onChange={(next) => setMatchTeam(next as Team)}
                    className="w-full"
                  />
                </div>
              )}

              {activeInfoTab === 'recruit' && (
                <div className="flex flex-col md:flex-row flex-wrap items-start gap-6 lg:gap-12">
                  <div className="w-full md:w-80">
                    <p className="mb-2 lg:mb-5 text-base lg:text-xl font-semibold leading-6 lg:leading-7 text-zinc-800">
                      모집 인원
                    </p>
                    <input
                      value={headcount}
                      onChange={(e) => setHeadcount(e.target.value)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="00"
                      className="h-12 lg:h-14 w-full md:w-80 rounded-xl lg:rounded-2xl border border-zinc-200 bg-neutral-50 px-4 lg:px-5 text-base lg:text-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    />
                  </div>
                  <div>
                    <p className="mb-2 lg:mb-5 text-base lg:text-xl font-semibold leading-6 lg:leading-7 text-zinc-800">
                      티켓 현황
                    </p>
                    <RadioGroup
                      name="ticketStatus"
                      value={ticketStatus}
                      onChange={(next) =>
                        setTicketStatus(next === 'have' || next === 'need' ? next : '')
                      }
                      options={[
                        { value: 'have', label: '티켓 보유 중. 동행 구함' },
                        { value: 'need', label: '티켓 X 동행 구한 후 티켓팅' },
                      ]}
                    />
                  </div>
                </div>
              )}

              {activeInfoTab === 'author' && (
                <div className="space-y-5 lg:space-y-6">
                  <div className="flex flex-col md:flex-row flex-wrap items-start gap-5 lg:gap-12">
                    <div className="w-full md:w-[300px]">
                      <p className="mb-2 lg:mb-5 text-base lg:text-xl font-semibold leading-6 lg:leading-7 text-zinc-800">
                        응원하는 팀
                      </p>
                      <TeamDropdown
                        items={baseBallTeamItems}
                        placeholder="팀 선택"
                        value={favTeam || null}
                        onChange={(next) => setFavTeam(next as Team)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 lg:mb-5 text-base lg:text-xl font-semibold leading-6 lg:leading-7 text-zinc-800">
                      성향
                    </p>
                    <PickedTagsField value={picked} onChange={setPicked} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 데스크탑: 7열 테이블 / 모바일: 카드형 리스트 */}
        <div className="w-full rounded-[20px] bg-neutral-50">
          {/* 테이블 헤더 - 데스크탑만 */}
          <div className="hidden lg:block rounded-t-2xl bg-neutral-100 px-10 py-6">
            <div className="grid grid-cols-[70px_220px_120px_1fr_120px_120px_120px] items-center gap-4 text-lg text-zinc-600">
              <p>번호</p>
              <p>경기 팀</p>
              <p>경기일자</p>
              <p>제목</p>
              <p className="text-center">모집 상태</p>
              <p className="text-right">작성자</p>
              <p className="text-right">게시일자</p>
            </div>
          </div>

          <div>
            {listLoading ? (
              <div className="px-5 lg:px-10 py-8 text-zinc-500">불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="px-5 lg:px-10 py-8 text-zinc-500">등록된 모집글이 없습니다.</div>
            ) : (
              posts.map((item, index) => {
                const status = getStatusFromItem(item);
                const statusClass =
                  status === '모집 중'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-indigo-50 text-blue-600';
                const authorNickname = item.authorNickname ?? '-';
                const rowNumber = (page - 1) * pageSize + index + 1;
                const teamLabel = `${TeamDescription[item.teamHome as Team] ?? item.teamHome} vs ${TeamDescription[item.teamAway as Team] ?? item.teamAway}`;

                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/home/${item.id}`)}
                    className="border-t border-zinc-200 px-5 lg:px-10 py-4 lg:py-5 first:border-t-0 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {/* 데스크탑: 7열 그리드 */}
                    <div className="hidden lg:grid grid-cols-[70px_220px_120px_1fr_120px_120px_120px] items-center gap-4">
                      <p className="text-lg text-zinc-500">{String(rowNumber).padStart(2, '0')}</p>
                      <p className="truncate text-lg font-medium text-zinc-800">{teamLabel}</p>
                      <p className="text-lg text-zinc-800">{formatGameDate(item.gameDate)}</p>
                      <p className="truncate text-lg text-zinc-800">{item.title}</p>
                      <div className="flex justify-center">
                        <span
                          className={`rounded-lg px-4 py-2.5 text-base font-medium ${statusClass}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="truncate text-right text-lg text-zinc-500">{authorNickname}</p>
                      <p className="text-right text-lg text-zinc-500">
                        {formatGameDate(item.createdAt)}
                      </p>
                    </div>

                    {/* 모바일: 카드형 */}
                    <div className="lg:hidden flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-b03-r text-zinc-500">{teamLabel}</span>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusClass}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-b02-m text-zinc-800 truncate">{item.title}</p>
                      <div className="flex items-center gap-3 text-c01-r text-zinc-400">
                        <span>{formatGameDate(item.gameDate)}</span>
                        <span>{authorNickname}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-4 lg:gap-7">
          <button
            type="button"
            className="text-xl lg:text-2xl text-stone-950 disabled:text-neutral-400"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            &lt;
          </button>
          <div className="flex items-center gap-1">
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`rounded-md px-3 lg:px-4 py-2 lg:py-2.5 text-sm lg:text-base ${
                  num === page ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-xl lg:text-2xl text-stone-950 disabled:text-neutral-400"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            &gt;
          </button>
        </div>
      </div>
    </main>
  );
}
