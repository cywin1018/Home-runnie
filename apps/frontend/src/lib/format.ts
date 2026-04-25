import { Team, TeamDescription } from '@homerunnie/shared';

export const formatKoreanDate = (date: Date): string => {
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\./g, '/')
    .replace(/\s/g, '');
};

export const formatKoreanTime = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatKoreanFullDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

export const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const formatTeamName = (team: string | null): string => {
  if (!team) return '-';
  return TeamDescription[team as Team] ?? team;
};
