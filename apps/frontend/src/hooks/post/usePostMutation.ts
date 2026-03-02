'use client';

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { CreateRecruitmentPostRequest, CreateRecruitmentPostResponse } from '@homerunnie/shared';
import {
  createRecruitmentComment,
  createRecruitmentPost,
  CreateRecruitmentCommentRequest,
  RecruitmentCommentResponse,
  updateRecruitmentPostStatus,
  UpdateRecruitmentPostStatusRequest,
  UpdateRecruitmentPostStatusResponse,
} from '@/apis/post/post';

export const useCreateRecruitmentPostMutation = (
  options?: UseMutationOptions<CreateRecruitmentPostResponse, Error, CreateRecruitmentPostRequest>,
) => {
  return useMutation({
    mutationFn: createRecruitmentPost,
    ...options,
  });
};

export const useUpdateRecruitmentPostStatusMutation = (
  postId: number,
  options?: UseMutationOptions<
    UpdateRecruitmentPostStatusResponse,
    Error,
    UpdateRecruitmentPostStatusRequest
  >,
) => {
  return useMutation({
    mutationFn: (data) => updateRecruitmentPostStatus(postId, data),
    ...options,
  });
};

export const useCreateRecruitmentCommentMutation = (
  postId: number,
  options?: UseMutationOptions<RecruitmentCommentResponse, Error, CreateRecruitmentCommentRequest>,
) => {
  return useMutation({
    mutationFn: (data) => createRecruitmentComment(postId, data),
    ...options,
  });
};
