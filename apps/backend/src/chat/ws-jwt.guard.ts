import { CanActivate, ExecutionContext, Injectable, createParamDecorator } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface WsSocketUser {
  memberId: number;
  nickname: string;
  roomIds: Set<string>;
}

export function extractTokenFromSocket(socket: Socket): string | null {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return null;

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(value);
    }
  });

  return cookies['accessToken'] ?? null;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    return !!client.data?.user;
  }
}

export const WsUser = createParamDecorator((_: unknown, ctx: ExecutionContext): WsSocketUser => {
  const client = ctx.switchToWs().getClient<Socket>();
  return client.data.user as WsSocketUser;
});
