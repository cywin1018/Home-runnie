'use client';

import Image from 'next/image';
import { Team } from '@homerunnie/shared';

interface TeamProfileAvatarProps {
  supportTeam?: Team | string | null;
  size?: number;
  className?: string;
}

const TEAM_PROFILE_ASSET_MAP: Record<Team, string> = {
  [Team.LG]: '/profile/red1.svg',
  [Team.KIWOOM]: '/profile/red1.svg',
  [Team.KIA]: '/profile/red2.svg',
  [Team.SSG]: '/profile/red2.svg',
  [Team.LOTTE]: '/profile/red2.svg',
  [Team.HANWHA]: '/profile/orange.svg',
  [Team.SAMSUNG]: '/profile/blue.svg',
  [Team.NC]: '/profile/blue.svg',
  [Team.DOOSAN]: '/profile/blue.svg',
  [Team.KT]: '/profile/default.svg',
};

function normalizeTeam(team?: Team | string | null): Team | null {
  if (!team) return null;
  const upper = String(team).toUpperCase();
  return (Object.values(Team) as string[]).includes(upper) ? (upper as Team) : null;
}

export function TeamProfileAvatar({
  supportTeam,
  size = 68,
  className = '',
}: TeamProfileAvatarProps) {
  const normalizedTeam = normalizeTeam(supportTeam);
  const src = normalizedTeam ? TEAM_PROFILE_ASSET_MAP[normalizedTeam] : '/profile/default.svg';
  const avatarStyle = className ? undefined : { width: size, height: size };

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={avatarStyle}>
      <Image src={src} alt="유저 프로필" fill className="object-cover" />
    </div>
  );
}
