'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BgmIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M7.07031 15.7139V5.49958C7.07031 5.06564 7.42209 4.71387 7.85603 4.71387H15.7132C16.1471 4.71387 16.4989 5.06564 16.4989 5.49958V15.7139"
      stroke="currentColor"
      strokeWidth="1.57143"
      strokeLinecap="square"
    />
    <rect x="7.07031" y="7.07129" width="9.42857" height="3.14286" fill="currentColor" />
    <ellipse
      cx="5.449"
      cy="16.889"
      rx="2.483"
      ry="1.964"
      transform="rotate(-26.1 5.449 16.889)"
      fill="currentColor"
    />
    <ellipse
      cx="14.879"
      cy="16.999"
      rx="2.483"
      ry="1.964"
      transform="rotate(-26.1 14.879 16.999)"
      fill="currentColor"
    />
  </svg>
);

const tagVariants = cva(
  'inline-flex items-center gap-1.5 sm:gap-3 rounded-[100px] px-2.5 sm:px-4 py-1 sm:py-2 whitespace-nowrap w-auto select-none transition-colors outline outline-1 outline-offset-[-1px] cursor-pointer',
  {
    variants: {
      state: {
        default: 'bg-neutral-100 outline-zinc-400 text-zinc-500',
        selected: 'bg-green-50 outline-main-green text-main-green',
      },
      size: {
        sm: 'text-xs sm:text-sm',
        md: 'text-xs sm:text-base',
        lg: 'text-sm sm:text-lg',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  },
);

export interface BgmTagProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tagVariants> {
  text: string;
  selected?: boolean;
}

export const BgmTag = React.forwardRef<HTMLDivElement, BgmTagProps>(
  ({ className, text, selected = false, size, state, ...props }, ref) => {
    const s = selected ? 'selected' : (state ?? 'default');
    return (
      <div ref={ref} className={cn(tagVariants({ state: s, size }), className)} {...props}>
        <BgmIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
        <span className="font-normal">{text}</span>
      </div>
    );
  },
);
BgmTag.displayName = 'BgmTag';
