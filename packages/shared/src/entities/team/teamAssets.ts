import { Team } from './team';

export const DEFAULT_PROFILE_IMAGE = '/icons/default.svg';

/* 추후 이미지 수정 필요!! */
export const TEAM_ASSETS: Partial<Record<Team, { image: string }>> = {
  [Team.DOOSAN]: { image: '/icons/default.svg' },
  [Team.HANWHA]: { image: '/icons/orange.svg' },
  [Team.KIWOOM]: { image: '/icons/red.svg' },
  [Team.KIA]: { image: '/icons/red.svg' },
  [Team.KT]: { image: '/icons/default.svg' },
  [Team.LG]: { image: '/icons/pink.svg' },
  [Team.LOTTE]: { image: '/icons/default.svg' },
  [Team.NC]: { image: '/icons/default.svg' },
  [Team.SAMSUNG]: { image: '/icons/blue.svg' },
  [Team.SSG]: { image: '/icons/red.svg' },
};
