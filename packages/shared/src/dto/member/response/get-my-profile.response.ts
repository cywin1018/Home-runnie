import { Team } from '../../../entities/team/team';

export interface GetMyProfileResponse {
  memberId: number;
  nickname: string;
  supportTeam: Team | null;
  oauthProvider: string;
  accountStatus: string;
  warnCount: number;
}
