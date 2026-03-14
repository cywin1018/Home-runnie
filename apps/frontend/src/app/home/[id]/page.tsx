'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Team, TeamDescription, TeamLogoUrl, baseBallStadiumItems } from '@homerunnie/shared';
import {
  useRecruitmentCommentsQuery,
  useRecruitmentPostDetailQuery,
} from '@/hooks/post/usePostQuery';
import { useMyProfileQuery } from '@/hooks/my/useProfileQuery';
import { BgmTag } from '@/shared/ui/tag/bgm-tag';
import { ReportModal } from '@/shared/ui/modal';
import {
  useCreateRecruitmentCommentMutation,
  useUpdateRecruitmentPostStatusMutation,
} from '@/hooks/post/usePostMutation';
import { useEffect, useState } from 'react';

const TEAM_VALUES = new Set<string>(Object.values(Team));
const STADIUM_LABEL_MAP = new Map(baseBallStadiumItems.map((item) => [item.value, item.label]));
const TICKETING_TEXT_MAP: Record<string, string> = {
  SEPARATE: '티켓 보유 중 · 동행 구함',
  TOGETHER: '티켓X 동행 구한 후 티켓팅',
};

const GENDER_TEXT_MAP: Record<string, string> = {
  M: '남자',
  F: '여자',
  MALE: '남자',
  FEMALE: '여자',
  ANY: '상관없음',
};

function toTeam(value: string | null | undefined): Team | null {
  if (!value) {
    return null;
  }
  return TEAM_VALUES.has(value) ? (value as Team) : null;
}

function TeamLogoCard({ team }: { team: Team | null }) {
  if (!team) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 text-xs text-gray-500">
        로고 없음
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-gray-100">
        <Image src={TeamLogoUrl[team]} alt={TeamDescription[team]} fill className="object-cover" />
      </div>
      <p className="text-b03-r text-gray-800">{TeamDescription[team]}</p>
    </div>
  );
}

export default function RecruitmentPostDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);
  const { data, isLoading, isError } = useRecruitmentPostDetailQuery(postId);
  const { data: comments = [] } = useRecruitmentCommentsQuery(postId);
  const { data: myProfile } = useMyProfileQuery({ retry: false });
  const [isRecruiting, setIsRecruiting] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState<number | null>(null);
  const { mutate: updatePostStatus, isPending: isUpdatingStatus } =
    useUpdateRecruitmentPostStatusMutation(postId, {
      onSuccess: (response) => {
        setIsRecruiting(response.postStatus === 'ACTIVE');
        queryClient.invalidateQueries({ queryKey: ['recruitment-post-detail', postId] });
      },
    });
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateRecruitmentCommentMutation(postId, {
      onSuccess: () => {
        setCommentInput('');
        queryClient.invalidateQueries({ queryKey: ['recruitment-comments', postId] });
      },
    });

  const handleSubmitComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed || isCreatingComment) return;
    createComment({ content: trimmed });
  };

  useEffect(() => {
    if (!data) return;
    setIsRecruiting(data.postStatus === 'ACTIVE');
  }, [data]);

  if (isLoading) {
    return <div className="py-20 text-center text-gray-500">상세 정보를 불러오는 중...</div>;
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 mb-4">모집글을 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={() => router.push('/home')}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  const homeTeam = toTeam(data.teamHome);
  const awayTeam = toTeam(data.teamAway);
  const supportTeam = toTeam(data.supportTeam);
  const formattedDate = new Date(data.gameDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const stadiumLabel = STADIUM_LABEL_MAP.get(
    data.stadium as (typeof baseBallStadiumItems)[number]['value'],
  );
  const writerTraits = data.picked ?? [];
  const ticketingText = data.ticketingType ? TICKETING_TEXT_MAP[data.ticketingType] : undefined;
  const genderText = data.gender ? (GENDER_TEXT_MAP[data.gender] ?? data.gender) : '-';
  const preferGenderText = data.prefGender
    ? (GENDER_TEXT_MAP[data.prefGender] ?? data.prefGender)
    : data.preferGender
      ? (GENDER_TEXT_MAP[data.preferGender] ?? data.preferGender)
      : '-';
  const isAuthor = Boolean(myProfile?.memberId && data.authorId === myProfile.memberId);
  const canSubmitComment = commentInput.trim().length > 0 && !isCreatingComment;
  const reportParticipants = Array.from(
    new Set(
      [data.authorNickname, ...comments.map((c) => c.authorNickname), myProfile?.nickname].filter(
        (name): name is string => Boolean(name),
      ),
    ),
  );

  return (
    <div className="py-10">
      <div>
        <p className="mb-2 text-b02-sb text-gray-600">제목</p>
        <div className="mb-10 flex items-start justify-between gap-4">
          <h1 className="text-t00 font-bold leading-tight text-gray-900">{data.title}</h1>
          <p className="inline-flex shrink-0 items-center gap-2 text-b02-sb text-gray-700">
            <Image src="/icons/profile.svg" alt="" width={20} height={20} aria-hidden />
            {data.authorNickname ?? '작성자'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="relative h-80 rounded-[20px] bg-neutral-50 p-[30px] shadow-[0_10.3px_20.6px_rgba(0,0,0,0.03)]">
            <h2 className="text-t03-sb text-stone-950">경기 정보</h2>

            <div className="mt-7 grid grid-cols-[1fr_1.4fr] gap-8">
              <div className="space-y-7">
                <div>
                  <p className="mb-3 inline-flex items-center gap-3 text-lg text-zinc-700">
                    <Image src="/icons/calendar.svg" alt="" width={28} height={28} aria-hidden />
                    경기 날짜
                  </p>
                  <p className="text-lg text-stone-950">{formattedDate}</p>
                </div>

                <div>
                  <p className="mb-3 inline-flex items-center gap-3 text-lg text-zinc-700">
                    <Image src="/icons/stadium.svg" alt="" width={28} height={28} aria-hidden />
                    경기 구장
                  </p>
                  <p className="text-lg text-stone-950">{stadiumLabel ?? data.stadium}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 inline-flex items-center gap-3 text-lg text-zinc-700">
                  <Image src="/icons/team.svg" alt="" width={28} height={28} aria-hidden />
                  경기하는 팀
                </p>
                <div className="mt-2 flex items-center justify-between gap-5">
                  <TeamLogoCard team={homeTeam} />
                  <p className="text-lg font-bold text-stone-950">VS</p>
                  <TeamLogoCard team={awayTeam} />
                </div>
              </div>
            </div>
          </section>

          <section className="relative h-80 rounded-[20px] bg-neutral-50 p-10 shadow-[0_10.3px_20.6px_rgba(0,0,0,0.03)]">
            <h2 className="text-t03-sb text-stone-950">모집 정보</h2>

            <div className="mt-10 grid grid-cols-2 gap-8">
              <div>
                <p className="mb-3 inline-flex items-center gap-3 text-lg text-zinc-700">
                  <Image src="/icons/memberHope.svg" alt="" width={28} height={28} aria-hidden />
                  모집 인원
                </p>
                <p className="text-xl font-semibold text-stone-950">
                  {String(data.recruitmentLimit).padStart(2, '0')}
                  <span className="ml-1 text-lg font-normal">명</span>
                </p>
              </div>

              <div>
                <p className="mb-3 inline-flex items-center gap-3 text-lg text-zinc-700">
                  <Image src="/icons/memberReal.svg" alt="" width={28} height={28} aria-hidden />
                  현재 모집된 인원
                </p>
                <p className="text-xl font-semibold text-stone-950">
                  {String(data.currentParticipants).padStart(2, '0')}
                  <span className="ml-1 text-lg font-normal">명</span>
                </p>
              </div>
            </div>

            <div className="mt-10">
              <p className="mb-3 inline-flex items-center gap-3 text-lg text-zinc-700">
                <Image src="/icons/ticket.svg" alt="" width={28} height={28} aria-hidden />
                티켓 현황
              </p>
              <p className="text-b02-r text-gray-900">{ticketingText ?? '미정'}</p>
            </div>
          </section>
        </div>

        <section className="mt-6 h-80 rounded-[20px] bg-neutral-50 p-[30px] shadow-[0_10.3px_20.6px_rgba(0,0,0,0.03)]">
          <h2 className="text-t03-sb text-stone-950">작성자 정보</h2>
          <div className="mt-8 grid grid-cols-[220px_180px_1fr] gap-8">
            <div>
              <p className="mb-4 inline-flex items-center gap-3 text-lg text-zinc-700">
                <Image src="/icons/team.svg" alt="" width={28} height={28} aria-hidden />
                응원하는 팀
              </p>
              <TeamLogoCard team={supportTeam} />
            </div>

            <div>
              <p className="mb-4 inline-flex items-center gap-3 text-lg text-zinc-700">
                <Image src="/icons/gender.svg" alt="" width={28} height={28} aria-hidden />
                작성자 성별
              </p>
              <p className="text-lg text-stone-950">{genderText}</p>

              <p className="mb-4 mt-6 inline-flex items-center gap-3 text-lg text-zinc-700">
                <Image src="/icons/gender.svg" alt="" width={28} height={28} aria-hidden />
                선호하는 성별
              </p>
              <p className="text-lg text-stone-950">{preferGenderText}</p>
            </div>

            <div>
              <p className="mb-4 inline-flex items-center gap-3 text-lg text-zinc-700">
                <Image src="/icons/writer.svg" alt="" width={28} height={28} aria-hidden />
                작성자 성향
              </p>
              <div className="flex flex-wrap gap-3">
                {writerTraits.map((trait) => (
                  <BgmTag key={trait} text={trait} size="sm" />
                ))}
                {writerTraits.length === 0 ? <p className="text-b03-r text-gray-500">-</p> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[20px] bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-t03-sb text-gray-900">하고 싶은 말</h2>
          <p className="text-b02-r whitespace-pre-wrap text-gray-700">{data.message || '-'}</p>
        </section>

        <section className="mt-10">
          {isAuthor ? (
            <>
              <div className="mb-3 flex justify-end">
                <p className="text-b02-sb text-gray-900">상태</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => updatePostStatus({ postStatus: 'ACTIVE' })}
                  disabled={isUpdatingStatus}
                  className={`h-16 w-64 rounded-2xl text-lg font-semibold ${
                    isRecruiting ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-400'
                  }`}
                >
                  모집 중
                </button>
                <button
                  type="button"
                  onClick={() => updatePostStatus({ postStatus: 'CLOSE' })}
                  disabled={isUpdatingStatus}
                  className={`h-16 w-64 rounded-2xl text-lg font-semibold ${
                    isRecruiting ? 'bg-zinc-200 text-zinc-400' : 'bg-black text-white'
                  }`}
                >
                  모집 완료
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!isRecruiting}
                className={`inline-flex h-16 w-[460px] items-center justify-center gap-2.5 rounded-2xl px-44 py-5 ${
                  isRecruiting ? 'bg-stone-950' : 'bg-zinc-200'
                }`}
              >
                <span
                  className={`text-lg font-semibold leading-7 ${
                    isRecruiting ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  신청하기
                </span>
              </button>
            </div>
          )}
        </section>

        <section className="mt-16">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-gray-900">댓글</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm text-zinc-500"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Image src="/icons/alert.svg" alt="" width={16} height={16} aria-hidden />
              신고하기
            </button>
          </div>

          <div className="mb-4 flex gap-3">
            <input
              className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 text-base outline-none"
              placeholder="자유롭게 댓글을 작성해주세요"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <button
              type="button"
              className={`inline-flex h-14 w-32 items-center justify-center gap-2.5 rounded-[10px] px-3.5 py-2.5 ${
                canSubmitComment ? 'bg-stone-950' : 'bg-zinc-200'
              }`}
              onClick={handleSubmitComment}
              disabled={!canSubmitComment}
            >
              <span className="inline-flex items-center justify-start gap-1">
                <span
                  className={`text-lg font-normal leading-7 ${
                    canSubmitComment ? 'text-white' : 'text-neutral-400'
                  }`}
                >
                  완료
                </span>
              </span>
            </button>
          </div>

          <div className="bg-neutral-100 overflow-hidden rounded-2xl border border-zinc-300">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={` px-5 py-5 outline-1 -outline-offset-1 outline-zinc-200 ${
                  index === 0 ? 'rounded-tl-2xl rounded-tr-2xl' : ''
                } ${index === comments.length - 1 ? 'rounded-bl-2xl rounded-br-2xl' : ''}`}
              >
                <div className="flex items-end justify-between gap-4">
                  <p className="text-lg leading-7 text-black">{comment.content}</p>
                  <div className="relative">
                    <button
                      type="button"
                      className="text-zinc-400"
                      onClick={() =>
                        setOpenCommentMenuId((prev) => (prev === comment.id ? null : comment.id))
                      }
                    >
                      ⋮
                    </button>
                    {openCommentMenuId === comment.id ? (
                      <button
                        type="button"
                        className="absolute right-0 top-7 z-20 inline-flex min-w-[96px] items-center justify-center whitespace-nowrap rounded-lg bg-neutral-50 px-5 py-2.5 shadow-[0_10.3px_20.6px_rgba(0,0,0,0.03)]"
                        onClick={() => {
                          setOpenCommentMenuId(null);
                          setIsReportModalOpen(true);
                        }}
                      >
                        <span className="text-sm font-normal leading-5 text-zinc-900">
                          신고하기
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 ? (
              <div className="px-5 py-5 text-sm text-zinc-500">아직 댓글이 없습니다.</div>
            ) : null}
          </div>
        </section>
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          participants={
            reportParticipants.length >= 2 ? reportParticipants : ['작성자', '댓글 작성자']
          }
        />
      </div>
    </div>
  );
}
