'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { baseBallTeamItems } from '@homerunnie/shared';

type Item = { value: string | number; label: string };

type Props = {
  value?: string | number | null;
  onChange?: (next: string | number) => void;
  items?: Item[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fitContent?: boolean;
  minWidth?: number;
  maxWidth?: number;
};

export default function TeamDropdown({
  value,
  onChange,
  items = baseBallTeamItems as unknown as Item[],
  placeholder = '팀 선택',
  className,
  disabled,
  fitContent = false,
  minWidth = 192,
  maxWidth = 384,
}: Props) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<string | number | null>(value ?? null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    const v = value ?? internal;
    return v != null ? (items.find((i) => i.value === v)?.label ?? '') : '';
  }, [value, internal, items]);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const select = (val: string | number) => {
    setInternal(val);
    onChange?.(val);
    setOpen(false);
  };

  const widthStyle = fitContent ? { minWidth, maxWidth } : undefined;

  return (
    <div
      ref={rootRef}
      className={clsx(fitContent ? 'relative inline-block' : 'relative w-full', className)}
    >
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        style={widthStyle}
        className={clsx(
          'h-14 px-5 inline-flex items-center justify-between rounded-2xl border border-zinc-200 bg-neutral-50',
          fitContent ? 'w-auto whitespace-nowrap' : 'w-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <span
          className={clsx(
            "text-lg leading-relaxed font-['Pretendard']",
            selectedLabel ? 'text-black' : 'text-neutral-400',
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <span className="relative h-6 w-6 overflow-hidden" aria-hidden>
          <Image
            src="/icons/arrow-bottom.svg"
            alt=""
            width={24}
            height={24}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={widthStyle}
          className={clsx('absolute left-0 top-full z-50 mt-5', fitContent ? 'w-auto' : 'w-full')}
        >
          <div className="max-h-72 overflow-auto rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_32px_0_rgb(0_0_0/0.05),_4px_0_32px_0_rgb(0_0_0/0.05)]">
            {items.map((item) => {
              const isSelected = (value ?? internal) === item.value;
              return (
                <button
                  key={String(item.value)}
                  role="option"
                  onClick={() => select(item.value)}
                  aria-selected={isSelected}
                  className={clsx(
                    'relative h-14 w-full px-5 text-left cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
                    isSelected ? 'bg-neutral-50' : 'hover:bg-neutral-50',
                  )}
                >
                  <span className="text-lg leading-relaxed font-['Pretendard'] text-neutral-700">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
