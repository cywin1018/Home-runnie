'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import DateSelect from '@/shared/ui/write/date-select';
import { RadioGroup } from '@/shared/ui/radio';
import TeamDropdown from '@/shared/ui/dropdown/team-dropdown';
import { CtaButton } from '@/shared/ui/button/cta-button';
import { baseBallTeamItems, baseBallStadiumItems, Stadium } from '@homerunnie/shared';
import { useCreateRecruitmentPostMutation } from '@/hooks/post/usePostMutation';
import { createChatRoom } from '@/apis/chat/chat';
import { writeFormSchema, type WriteFormValues } from './schema';
import { showToast, ToastIconType } from '@/shared/ui/toast/toast';
import PickedTagsField from './components/picked-tags-field';

export default function Page() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<WriteFormValues>({
    resolver: zodResolver(writeFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      ticketStatus: 'need',
      gender: 'M',
      prefGender: 'M',
      picked: [],
      note: '',
    },
  });

  const { mutate: createPost, isPending } = useCreateRecruitmentPostMutation({
    onSuccess: async (response) => {
      try {
        await createChatRoom(response.id);
        showToast('게시글과 채팅방이 성공적으로 생성되었습니다.', ToastIconType.SUCCESS);
      } catch {
        showToast('게시글은 생성되었지만 채팅방 생성에 실패했습니다.', ToastIconType.INFO);
      } finally {
        router.push('/home');
      }
    },
    onError: (error) => {
      showToast(error.message || '게시글 작성에 실패했습니다.', ToastIconType.INFO);
    },
  });

  const onSubmit = (data: WriteFormValues) => {
    createPost({
      ...data,
      gameDate: data.gameDate.toISOString(),
      stadium: data.stadium as Stadium,
      picked: data.picked ?? [],
    });
  };

  return (
    <div className="py-10">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/icons/pencil.svg" alt="연필" width={36} height={36} />
        <h1 className="text-4xl font-bold leading-[54.4px] text-stone-950">
          직관 메이트 모집글 작성하기
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <section className="mb-16">
          <p className="mb-2 text-lg leading-relaxed text-zinc-500">제목</p>
          <input
            {...register('title')}
            placeholder="제목을 입력해주세요"
            className="h-14 w-full rounded-2xl border border-zinc-200 bg-neutral-50 px-5 text-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
          {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title.message}</p>}
        </section>

        <section className="rounded-[20px] border border-zinc-200 bg-neutral-50 p-7 shadow-sm">
          <div className="mb-14">
            <p className="mb-7 text-lg leading-relaxed text-zinc-500">경기 정보</p>

            <div className="flex flex-wrap gap-7">
              <div className="w-80">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">경기 날짜</p>
                <Controller
                  name="gameDate"
                  control={control}
                  render={({ field }) => (
                    <>
                      <DateSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="경기 날짜 선택"
                        disabledBeforeToday
                        className="w-80"
                      />
                      {errors.gameDate && (
                        <p className="mt-2 text-sm text-red-500">{errors.gameDate.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="w-80">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">경기 구장</p>
                <Controller
                  name="stadium"
                  control={control}
                  render={({ field }) => (
                    <>
                      <TeamDropdown
                        items={baseBallStadiumItems}
                        placeholder="구장 선택"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full"
                      />
                      {errors.stadium && (
                        <p className="mt-2 text-sm text-red-500">{errors.stadium.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="w-96">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">경기하는 팀</p>
                <div className="flex items-center gap-4">
                  <Controller
                    name="teamA"
                    control={control}
                    render={({ field }) => (
                      <>
                        <TeamDropdown
                          items={baseBallTeamItems}
                          placeholder="팀 선택"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {errors.teamA && (
                          <p className="mt-2 text-sm text-red-500">{errors.teamA.message}</p>
                        )}
                      </>
                    )}
                  />
                  <span className="text-lg text-zinc-800">vs</span>
                  <Controller
                    name="teamB"
                    control={control}
                    render={({ field }) => (
                      <>
                        <TeamDropdown
                          items={baseBallTeamItems}
                          placeholder="팀 선택"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {errors.teamB && (
                          <p className="mt-2 text-sm text-red-500">{errors.teamB.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-14 w-[632px] max-w-full">
            <p className="mb-7 text-lg leading-relaxed text-zinc-500">모집 정보</p>

            <div className="flex flex-wrap items-start gap-14">
              <div className="w-80">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">모집 인원</p>
                <input
                  {...register('headcount')}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="00"
                  className="h-14 w-80 rounded-2xl border border-zinc-200 bg-neutral-50 px-5 text-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
                {errors.headcount && (
                  <p className="mt-2 text-sm text-red-500">{errors.headcount.message}</p>
                )}
              </div>

              <div className="w-62">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">티켓 현황</p>
                <Controller
                  name="ticketStatus"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      name="ticket"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: 'have', label: '티켓 보유 중. 동행 구함' },
                        { value: 'need', label: '티켓 X 동행 구한 후 티켓팅' },
                      ]}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="w-[978px] max-w-full">
            <p className="mb-7 text-lg leading-relaxed text-zinc-500">작성자 정보</p>

            <div className="mb-6 flex flex-wrap gap-14">
              <div className="w-80">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">응원하는 팀</p>
                <Controller
                  name="favTeam"
                  control={control}
                  render={({ field }) => (
                    <TeamDropdown
                      items={baseBallTeamItems}
                      placeholder="팀 선택"
                      value={field.value || ''}
                      onChange={field.onChange}
                      className="w-80"
                    />
                  )}
                />
              </div>

              <div className="w-20">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">성별</p>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      name="gender"
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={[
                        { value: 'F', label: '여자' },
                        { value: 'M', label: '남자' },
                      ]}
                    />
                  )}
                />
              </div>

              <div className="w-60">
                <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">선호하는 성별</p>
                <Controller
                  name="prefGender"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-12">
                      <RadioGroup
                        name="prefGenderA"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: 'F', label: '여자' },
                          { value: 'M', label: '남자' },
                        ]}
                      />
                      <RadioGroup
                        name="prefGenderB"
                        value={field.value}
                        onChange={field.onChange}
                        options={[{ value: 'ANY', label: '상관없음' }]}
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            <div>
              <p className="mb-5 text-xl font-semibold leading-7 text-zinc-800">성향</p>
              <Controller
                name="picked"
                control={control}
                render={({ field }) => (
                  <PickedTagsField value={field.value} onChange={(next) => field.onChange(next)} />
                )}
              />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <p className="mb-2 text-xl font-semibold leading-7 text-zinc-800">하고 싶은 말</p>
          <textarea
            {...register('note')}
            placeholder="하고싶은 말을 입력해주세요"
            className="h-52 w-full resize-none rounded-2xl border border-zinc-200 bg-neutral-50 px-5 py-4 text-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </section>

        <div className="mt-12 flex justify-end">
          <CtaButton
            variant="primary"
            size="default"
            type="submit"
            disabled={!isValid || isPending}
          >
            <div className="text-white text-lg font-semibold leading-7">
              {isPending ? '작성 중...' : '업로드하기'}
            </div>
          </CtaButton>
        </div>
      </form>
    </div>
  );
}
