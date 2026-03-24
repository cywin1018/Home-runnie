'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getRecruitmentComments,
  getRecruitmentPostDetail,
  getRecruitmentPosts,
  type GetRecruitmentPostsQueryParams,
} from '@/apis/post/post';

export const useRecruitmentPostsQuery = (params: GetRecruitmentPostsQueryParams = {}) => {
  return useQuery({
    queryKey: ['recruitment-posts', params],
    queryFn: () => getRecruitmentPosts(params),
    retry: false,
  });
};

export const useRecruitmentPostDetailQuery = (postId: number) => {
  return useQuery({
    queryKey: ['recruitment-post-detail', postId],
    queryFn: () => getRecruitmentPostDetail(postId),
    enabled: Number.isFinite(postId) && postId > 0,
  });
};

export const useRecruitmentCommentsQuery = (postId: number) => {
  return useQuery({
    queryKey: ['recruitment-comments', postId],
    queryFn: () => getRecruitmentComments(postId),
    enabled: Number.isFinite(postId) && postId > 0,
  });
};
