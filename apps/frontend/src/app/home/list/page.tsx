'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [page, setPage] = useState(1);
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>('game');
  const [gameDate, setGameDate] = useState<Date | null>(null);
  const [stadium, setStadium] = useState<Stadium | ''>('');
  const [matchTeam, setMatchTeam] = useState<Team | ''>('');
  const [headcount, setHeadcount] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'have' | 'need' | ''>('');
  const [favTeam, setFavTeam] = useState<Team | ''>('');
  const [gender, setGender] = useState<'F' | 'M' | ''>('');
  const [prefGender, setPrefGender] = useState<'F' | 'M' | 'ANY' | ''>('');
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
      gender: gender || undefined,
      prefGender: prefGender || undefined,
      picked: picked.length > 0 ? picked : undefined,
    }),
    [
      page,
      pageSize,
      gameDate,
      stadium,
      matchTeam,
      headcount,
      ticketStatus,
      favTeam,
      gender,
      prefGender,
      picked,
    ],
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
  }, [gameDate, stadium, matchTeam, headcount, ticketStatus, favTeam, gender, prefGender, picked]);

  return (
    <main className="w-full pb-24">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-16 pt-16">
        <div className="w-full space-y-7">
          <h1 className="text-4xl font-bold leading-[54.4px] text-stone-950">직관 메이트 구하기</h1>

          <div className="rounded-[20px] bg-neutral-50 p-7">
            <div className="flex items-center gap-2.5">
              <CtaButton
                type="button"
                variant="outline"
                size="md"
                onClick={() => setActiveInfoTab('game')}
                className={`h-auto rounded-none border-0 px-5 py-3.5 text-xl font-semibold leading-7 shadow-none ${
                  activeInfoTab === 'game'
                    ? 'border-b border-stone-950 text-stone-950 hover:bg-transparent'
                    : 'text-neutral-400 hover:bg-transparent'
                }`}
              >
                경기정보
              </CtaButton>
              <CtaButton
                type="button"
                variant="outline"
                size="md"
                onClick={() => setActiveInfoTab('recruit')}
                className={`h-auto rounded-none border-0 px-5 py-3.5 text-xl font-semibold leading-7 shadow-none ${
                  activeInfoTab === 'recruit'
                    ? 'border-b border-stone-950 text-stone-950 hover:bg-transparent'
                    : 'text-neutral-400 hover:bg-transparent'
                }`}
              >
                모집 정보
              </CtaButton>
              <CtaButton
                type="button"
                variant="outline"
                size="md"
                onClick={() => setActiveInfoTab('author')}
                className={`h-auto rounded-none border-0 px-5 py-3.5 text-xl font-semibold leading-7 shadow-none ${
                  activeInfoTab === 'author'
                    ? 'border-b border-stone-950 text-stone-950 hover:bg-transparent'
                    : 'text-neutral-400 hover:bg-transparent'
                }`}
              >
                작성자 정보
              </CtaButton>
            </div>

            <div className="mt-7">
              {activeInfoTab === 'game' && (
                <div className="grid grid-cols-3 items-center gap-9">
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
                <div className="flex flex-wrap items-start gap-12">
                  <div className="w-80">
                    <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">모집 인원</p>
                    <input
                      value={headcount}
                      onChange={(e) => setHeadcount(e.target.value)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="00"
                      className="h-14 w-80 rounded-2xl border border-zinc-200 bg-neutral-50 px-5 text-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    />
                  </div>
                  <div>
                    <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">티켓 현황</p>
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
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start gap-12">
                    <div className="w-[300px]">
                      <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">
                        응원하는 팀
                      </p>
                      <TeamDropdown
                        items={baseBallTeamItems}
                        placeholder="팀 선택"
                        value={favTeam || null}
                        onChange={(next) => setFavTeam(next as Team)}
                        className="w-[300px]"
                      />
                    </div>
                    <div>
                      <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">성별</p>
                      <RadioGroup
                        name="authorGender"
                        value={gender}
                        onChange={(next) => setGender(next === 'F' || next === 'M' ? next : '')}
                        options={[
                          { value: 'F', label: '여자' },
                          { value: 'M', label: '남자' },
                        ]}
                      />
                    </div>
                    <div>
                      <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">
                        선호하는 성별
                      </p>
                      <RadioGroup
                        name="prefGender"
                        value={prefGender}
                        onChange={(next) =>
                          setPrefGender(next === 'F' || next === 'M' || next === 'ANY' ? next : '')
                        }
                        direction="row"
                        gapClassName="gap-10"
                        options={[
                          { value: 'F', label: '여자' },
                          { value: 'M', label: '남자' },
                          { value: 'ANY', label: '상관없음' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">성향</p>
                    <PickedTagsField value={picked} onChange={setPicked} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full rounded-[20px] bg-neutral-50">
          <div className="rounded-t-2xl bg-neutral-100 px-10 py-6">
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
              <div className="px-10 py-8 text-zinc-500">불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="px-10 py-8 text-zinc-500">등록된 모집글이 없습니다.</div>
            ) : (
              posts.map((item, index) => {
                const status = getStatusFromItem(item);
                const statusClass =
                  status === '모집 중'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-indigo-50 text-blue-600';
                const authorNickname = item.authorNickname ?? '-';
                const rowNumber = (page - 1) * pageSize + index + 1;

                return (
                  <div
                    key={item.id}
                    className="border-t border-zinc-200 px-10 py-5 first:border-t-0"
                  >
                    <div className="grid grid-cols-[70px_220px_120px_1fr_120px_120px_120px] items-center gap-4">
                      <p className="text-lg text-zinc-500">{String(rowNumber).padStart(2, '0')}</p>
                      <p className="truncate text-lg font-medium text-zinc-800">
                        {`${TeamDescription[item.teamHome as Team] ?? item.teamHome} vs ${TeamDescription[item.teamAway as Team] ?? item.teamAway}`}
                      </p>
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
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-7">
          <button
            type="button"
            className="text-2xl text-stone-950 disabled:text-neutral-400"
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
                className={`rounded-md px-4 py-2.5 text-base ${
                  num === page ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-2xl text-stone-950 disabled:text-neutral-400"
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
