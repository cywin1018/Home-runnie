'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ko } from 'date-fns/locale';

type Props = {
  value?: Date | number | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabledBeforeToday?: boolean;
  className?: string;
  weekStartsOn?: 0 | 1;
};

type CSSVars = React.CSSProperties & { ['--day']?: string };
type Pos = { left: number; top: number } | null;

export default function DateSelect({
  value = null,
  onChange,
  placeholder = '경기 날짜 선택',
  disabledBeforeToday = true,
  className,
  weekStartsOn = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : null;
  const [cursor, setCursor] = useState<Date>(selectedDate ?? new Date());
  const [pos, setPos] = useState<Pos>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const text = selectedDate ? format(selectedDate, 'yyyy.MM.dd') : '';

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ left: r.left, top: r.bottom + 20 });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={clsx('relative inline-block', className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'relative inline-flex h-14 w-80 items-center justify-between rounded-2xl border border-zinc-200 px-5 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300',
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-neutral-50" />
        <span
          className={clsx(
            'z-10 text-lg font-normal leading-relaxed',
            text ? 'text-black' : 'text-neutral-400',
          )}
        >
          {text || placeholder}
        </span>
        <span className="relative z-10 h-6 w-6 overflow-hidden">
          <Image
            src="/icons/calendar.svg"
            alt="달력"
            width={24}
            height={24}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </span>
      </button>

      {open && pos && (
        <>
          <div className="fixed inset-0 z-49" onClick={() => setOpen(false)} />
          <CalendarPopup
            style={{ left: pos.left, top: pos.top }}
            cursor={cursor}
            onPrev={() => setCursor((d) => addMonths(d, -1))}
            onNext={() => setCursor((d) => addMonths(d, 1))}
            selected={selectedDate}
            onPick={(d) => {
              onChange?.(d);
              setCursor(d ?? new Date());
              setOpen(false);
            }}
            disabledBeforeToday={disabledBeforeToday}
            weekStartsOn={weekStartsOn}
          />
        </>
      )}
    </div>
  );
}

function CalendarPopup({
  style,
  cursor,
  onPrev,
  onNext,
  selected,
  onPick,
  disabledBeforeToday = true,
  weekStartsOn = 0,
}: {
  style: React.CSSProperties;
  cursor: Date;
  onPrev: () => void;
  onNext: () => void;
  selected: Date | null;
  onPick: (d: Date | null) => void;
  disabledBeforeToday?: boolean;
  weekStartsOn?: 0 | 1;
}) {
  const today = strip(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
    const list: Date[] = [];
    let d = start;
    while (!isAfter(d, end)) {
      list.push(d);
      d = addDays(d, 1);
    }
    return list;
  }, [cursor, weekStartsOn]);

  const weekLabels =
    weekStartsOn === 1
      ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleClickDay = (day: Date) => {
    if (disabledBeforeToday && isBefore(strip(day), today)) return;
    onPick(strip(day));
  };

  return (
    <div
      className={clsx(
        'fixed z-50 w-80 rounded-[20px] bg-white',
        'shadow-[0_10px_80px_0_rgba(0,0,0,0.08),10px_0_80px_0_rgba(0,0,0,0.08)]',
        'outline-1 outline-offset-[-1px] outline-zinc-200',
      )}
      style={style}
      role="dialog"
      aria-label="날짜 선택"
    >
      <div className="w-80 p-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 달"
            onClick={onPrev}
            className="grid h-7 w-7 place-items-center rounded-md hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 cursor-pointer"
          >
            <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
          </button>
          <div className="text-lg font-semibold tracking-tight text-stone-950">
            {format(cursor, 'M월 yyyy', { locale: ko })}
          </div>
          <button
            type="button"
            aria-label="다음 달"
            onClick={onNext}
            className="grid h-7 w-7 place-items-center rounded-md hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 cursor-pointer"
          >
            <Image src="/icons/arrow-right.svg" alt="" width={20} height={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-2 pb-3">
          {weekLabels.map((w) => (
            <div key={w} className="text-center text-sm font-medium text-zinc-500">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const out = !isSameMonth(day, cursor);
            const isDisabled = disabledBeforeToday && isBefore(strip(day), today);
            const isSelected = selected ? isSameDay(strip(day), strip(selected)) : false;
            return (
              <div
                key={day.toISOString()}
                className="relative flex items-center justify-center"
                style={{ ['--day']: '40px' } as CSSVars}
              >
                <button
                  type="button"
                  onClick={() => handleClickDay(day)}
                  disabled={isDisabled}
                  className={clsx(
                    'relative z-[1] mx-auto flex h-[var(--day)] w-[var(--day)] items-center justify-center rounded-full text-base transition',
                    isSelected
                      ? 'bg-main-green/10 ring-2 ring-main-green text-main-green'
                      : out
                        ? 'text-zinc-300 hover:bg-zinc-50'
                        : 'text-zinc-900 hover:bg-zinc-50',
                    isDisabled
                      ? 'cursor-not-allowed opacity-40 hover:bg-transparent'
                      : 'cursor-pointer active:scale-95',
                  )}
                >
                  {format(day, 'd')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function strip(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
