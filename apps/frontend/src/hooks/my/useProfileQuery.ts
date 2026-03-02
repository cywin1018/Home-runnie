'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getMyProfile } from '@/apis/my/member';
import { GetMyProfileResponse } from '@homerunnie/shared';

export type MyProfileResponse = GetMyProfileResponse & {
  memberId: number;
};

export const useMyProfileQuery = (
  options?: Omit<UseQueryOptions<MyProfileResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfile() as Promise<MyProfileResponse>,
    ...options,
  });
};

export const useMyProfileProtectedQuery = (
  options?: Omit<UseQueryOptions<MyProfileResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['my-profile-protected'],
    queryFn: () => getMyProfile({ authRequired: true }) as Promise<MyProfileResponse>,
    ...options,
  });
};
