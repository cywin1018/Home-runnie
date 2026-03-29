import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { MemberRepository } from '@/member/repository';
import { ChatRepository } from '@/chat/repository';
import { WsSocketUser } from './ws-jwt.guard';

type MockSocket = {
  id: string;
  data: { user?: WsSocketUser };
  emit: jest.Mock;
  join: jest.Mock;
  to: jest.Mock;
  disconnect: jest.Mock;
  handshake: { headers: { cookie?: string } };
};

const createMockSocket = (id: string, user?: WsSocketUser): MockSocket => ({
  id,
  data: { user },
  emit: jest.fn(),
  join: jest.fn(),
  to: jest.fn().mockReturnValue({ emit: jest.fn() }),
  disconnect: jest.fn(),
  handshake: { headers: {} },
});

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let loggerSpy: jest.SpyInstance;
  let mockServer: { to: jest.Mock };
  let mockJwtService: { verifyAsync: jest.Mock };
  let mockMemberRepository: { findMemberWithProfile: jest.Mock };
  let mockChatRepository: { findMessagesByRoomId: jest.Mock; saveMessage: jest.Mock };

  beforeEach(async () => {
    mockJwtService = { verifyAsync: jest.fn() };
    mockMemberRepository = { findMemberWithProfile: jest.fn() };
    mockChatRepository = {
      findMessagesByRoomId: jest.fn().mockResolvedValue([]),
      saveMessage: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret') } },
        { provide: MemberRepository, useValue: mockMemberRepository },
        { provide: ChatRepository, useValue: mockChatRepository },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    const mockEmit = jest.fn();
    mockServer = { to: jest.fn().mockReturnValue({ emit: mockEmit }) };
    gateway.server = mockServer as unknown as Server;
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('gateway가 정상적으로 생성되어야 한다', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('토큰이 없으면 disconnect한다', async () => {
      const socket = createMockSocket('test-1');
      await gateway.handleConnection(socket as unknown as Socket);
      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('JWT 검증 실패 시 disconnect한다', async () => {
      const socket = createMockSocket('test-1');
      socket.handshake.headers.cookie = 'accessToken=invalid';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await gateway.handleConnection(socket as unknown as Socket);
      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('프로필이 없으면 disconnect한다', async () => {
      const socket = createMockSocket('test-1');
      socket.handshake.headers.cookie = 'accessToken=validtoken';
      mockJwtService.verifyAsync.mockResolvedValue({ memberId: 1 });
      mockMemberRepository.findMemberWithProfile.mockResolvedValue([]);

      await gateway.handleConnection(socket as unknown as Socket);
      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('인증 성공 시 socket.data.user를 설정하고 authenticated를 emit한다', async () => {
      const socket = createMockSocket('test-1');
      socket.handshake.headers.cookie = 'accessToken=validtoken';
      mockJwtService.verifyAsync.mockResolvedValue({ memberId: 1 });
      mockMemberRepository.findMemberWithProfile.mockResolvedValue([
        { profile: { nickname: '테스터' } },
      ]);

      await gateway.handleConnection(socket as unknown as Socket);

      expect(socket.data.user).toMatchObject({ memberId: 1, nickname: '테스터' });
      expect(socket.emit).toHaveBeenCalledWith('authenticated');
    });
  });

  describe('handleDisconnect', () => {
    it('socket.data.user가 없으면 퇴장 알림을 보내지 않는다', () => {
      const socket = createMockSocket('user-1');
      gateway.handleDisconnect(socket as unknown as Socket);
      expect(socket.to).not.toHaveBeenCalled();
    });

    it('socket.data.user가 있으면 참여 중인 방에 퇴장 알림을 보낸다', () => {
      const user: WsSocketUser = {
        memberId: 1,
        nickname: '테스터',
        supportTeam: null,
        roomIds: new Set(['room1']),
      };
      const socket = createMockSocket('user-1', user);

      gateway.handleDisconnect(socket as unknown as Socket);

      expect(socket.to).toHaveBeenCalledWith('room1');
    });
  });

  describe('handleJoinRoom', () => {
    it('방에 join하고 message_history를 emit한다', async () => {
      const user: WsSocketUser = {
        memberId: 1,
        nickname: '테스터',
        supportTeam: null,
        roomIds: new Set(),
      };
      const socket = createMockSocket('user-1', user);
      mockChatRepository.findMessagesByRoomId.mockResolvedValue([]);

      await gateway.handleJoinRoom(user, { roomId: 'room1' }, socket as unknown as Socket);

      expect(socket.join).toHaveBeenCalledWith('room1');
      expect(user.roomIds.has('room1')).toBe(true);
      expect(socket.emit).toHaveBeenCalledWith('message_history', []);
    });

    it('방 전체에 입장 메시지를 보낸다', async () => {
      const user: WsSocketUser = {
        memberId: 1,
        nickname: '테스터',
        supportTeam: null,
        roomIds: new Set(),
      };
      const socket = createMockSocket('user-1', user);
      mockChatRepository.findMessagesByRoomId.mockResolvedValue([]);

      await gateway.handleJoinRoom(user, { roomId: 'room1' }, socket as unknown as Socket);

      expect(socket.to).toHaveBeenCalledWith('room1');
      const toResult = socket.to('room1');
      expect(toResult.emit).toHaveBeenCalledWith('user_joined', {
        nickname: '테스터',
        message: '테스터님이 입장하셨습니다.',
      });
    });
  });

  describe('handleMessage', () => {
    it('참여하지 않은 방이면 메시지를 전송하지 않는다', async () => {
      const user: WsSocketUser = {
        memberId: 1,
        nickname: '테스터',
        supportTeam: null,
        roomIds: new Set(),
      };
      const socket = createMockSocket('user-1', user);

      await gateway.handleMessage(
        user,
        { message: '안녕', roomId: 'room1' },
        socket as unknown as Socket,
      );

      expect(socket.to).not.toHaveBeenCalled();
      expect(socket.emit).not.toHaveBeenCalled();
    });

    it('나를 제외한 방 사람들에게 isOwn: false로 메시지를 전송한다', async () => {
      const user: WsSocketUser = {
        memberId: 1,
        nickname: '테스터',
        supportTeam: null,
        roomIds: new Set(['room1']),
      };
      const socket = createMockSocket('user-1', user);

      await gateway.handleMessage(
        user,
        { message: '안녕하세요', roomId: 'room1' },
        socket as unknown as Socket,
      );

      expect(socket.to).toHaveBeenCalledWith('room1');
      const toResult = socket.to('room1');
      expect(toResult.emit).toHaveBeenCalledWith('received_message', {
        nickname: '테스터',
        message: '안녕하세요',
        isOwn: false,
      });
    });

    it('나에게 isOwn: true로 메시지를 전송한다', async () => {
      const user: WsSocketUser = {
        memberId: 1,
        nickname: '테스터',
        supportTeam: null,
        roomIds: new Set(['room1']),
      };
      const socket = createMockSocket('user-1', user);

      await gateway.handleMessage(
        user,
        { message: '안녕하세요', roomId: 'room1' },
        socket as unknown as Socket,
      );

      expect(socket.emit).toHaveBeenCalledWith('received_message', {
        nickname: '테스터',
        message: '안녕하세요',
        isOwn: true,
      });
    });
  });
});
