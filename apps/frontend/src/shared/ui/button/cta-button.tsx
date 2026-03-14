'use client';

import * as React from 'react';
import { Button as ShadButton } from '@/shared/ui/primitives/button';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * CTA 버튼 변형
 * - primary: 진한 솔리드(검정) + 흰 글자
 * - secondary: 중간 회색 솔리드 + 흰 글자
 * - subtle: 연회색 솔리드(비활성 느낌)
 * - outline: 테두리만, 배경 투명
 *
 * ※ 색상은 전부 디자인 토큰/팔레트 기준 (Tailwind v4 변수)
 */
const ctaVariants = cva(
  'inline-flex items-center justify-center rounded-xl transition-colors select-none cursor-pointer ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-gray-600 text-gray-50 hover:bg-gray-600/90 dark:text-gray-100',
        subtle: 'bg-gray-200 text-gray-500 hover:bg-gray-200/90',
        outline:
          'bg-transparent border border-gray-700 text-gray-800 ' +
          'hover:bg-gray-800/5 dark:text-gray-200',
      },
      size: {
        default: 'h-[4.375rem] w-[28.75rem] px-4 py-2',
        sm: 'h-9 px-4 b02-sb',
        md: 'h-10 px-5 b02-sb',
        lg: 'h-11 px-6 b01-sb',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface CtaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof ctaVariants> {
  asChild?: boolean;
}

/**
 * shadcn Button을 얇게 래핑한 CTA 버튼
 * - 디자인 토큰/팔레트만 사용
 * - disabled는 HTML disabled 속성으로 처리(스타일 유지)
 */
export const CtaButton = React.forwardRef<HTMLButtonElement, CtaButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <ShadButton
        ref={ref}
        className={cn(
          ctaVariants({ variant, size }),
          disabled && 'opacity-100 bg-gray-200 text-gray-500 border-0 hover:bg-gray-200',
          className,
        )}
        disabled={disabled}
        {...props}
      />
    );
  },
);
CtaButton.displayName = 'CtaButton';

export { ctaVariants };
