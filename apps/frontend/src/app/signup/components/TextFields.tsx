'use client';

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { TextField } from '@/shared/ui/input/text-field';
import { Dropdown } from '@/shared/ui/dropdown/dropdown';
import { Button } from '@/shared/ui/primitives/button';
import { FormLabel } from './FormLabel';

import Image from 'next/image';
import {
  DEFAULT_PROFILE_IMAGE,
  TEAM_ASSETS,
  GenderDescription,
  TeamDescription,
} from '@homerunnie/shared';
import { useCompleteSignUpMutation } from '@/hooks/auth/useAuthMutation';

import { signupSchema, SignupFormValues } from '../schema';
import { showToast, ToastIconType } from '@/shared/ui/toast/toast';

interface FieldConfig {
  name: keyof SignupFormValues;
  label: string;
  type: 'text' | 'dropdown';
  placeholder: string;
  items?: { options: { value: string; text: string }[] }[];
}

export default function TextFields() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const toDropdownOptions = (descriptionObj: Record<string, string>) => [
    {
      options: Object.entries(descriptionObj).map(([key, label]) => ({
        value: key,
        text: label,
      })),
    },
  ];

  const genderOptions = useMemo(
    () =>
      toDropdownOptions(
        Object.fromEntries(Object.entries(GenderDescription).filter(([key]) => key !== 'OTHER')),
      ),
    [],
  );
  const teamOptions = useMemo(() => toDropdownOptions(TeamDescription), []);

  const formFields: FieldConfig[] = [
    {
      name: 'nickName',
      label: '이름',
      type: 'text',
      placeholder: '이름을 입력해주세요',
    },
    {
      name: 'gender',
      label: '성별',
      type: 'dropdown',
      placeholder: '성별을 선택하세요',
      items: genderOptions,
    },
    {
      name: 'birthDate',
      label: '생년월일',
      type: 'text',
      placeholder: '0000.00.00',
    },
    {
      name: 'phoneNumber',
      label: '휴대폰 번호',
      type: 'text',
      placeholder: '010-0000-0000',
    },
    {
      name: 'supportTeam',
      label: '응원하는 팀',
      type: 'dropdown',
      placeholder: '응원하는 팀을 선택하세요.',
      items: teamOptions,
    },
  ];

  const { mutate: signupMutate } = useCompleteSignUpMutation({
    onSuccess: () => {
      router.push('/home');
    },
    onError: (error) => {
      console.error(error);
      showToast('회원가입에 실패했습니다.', ToastIconType.INFO);
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutate(data);
  };

  const selectedTeam = watch('supportTeam');
  const teamAssets = selectedTeam ? TEAM_ASSETS[selectedTeam] : undefined;
  const profileImage = teamAssets?.image ?? DEFAULT_PROFILE_IMAGE;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="gap-12 w-full items-center flex flex-col">
      <Image
        src={profileImage}
        width={170}
        height={170}
        className={'rounded-full'}
        alt={'프로필 사진'}
      />
      <div className="flex flex-col gap-[60px] w-full">
        <div className="flex flex-col justify-start gap-5 w-full">
          {formFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2.5 w-full">
              <FormLabel>{field.label}</FormLabel>

              {field.type === 'text' ? (
                <TextField
                  {...register(field.name)}
                  className="h-[60px] px-[22px] py-4 leading-[28px] text-b02-m! placeholder:font-normal font-medium placeholder:text-gray-200"
                  placeholder={field.placeholder}
                  errorMessage={errors[field.name]?.message}
                />
              ) : (
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      className="h-[60px]! px-[22px] py-4 text-b02-m hover:border-gray-200"
                      placeholder={field.placeholder}
                      items={field.items || []}
                      value={value || undefined}
                      onValueChange={onChange}
                      errorMessage={errors[field.name]?.message}
                    />
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-16 text-b01-sb text-white rounded-[16px]! cursor-pointer"
          size="lg"
          disabled={!isValid}
        >
          회원가입 완료
        </Button>
      </div>
    </form>
  );
}
