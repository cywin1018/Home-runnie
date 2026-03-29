import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from '@/chat/dto/room-join.dto';
import { CreateMessageDto } from '@/chat/dto/create-message.dto';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MemberRepository } from '@/member/repository';
import { ChatRepository } from '@/chat/repository';
import { JwtPayload } from '@/auth/types';
import { WsJwtGuard, WsSocketUser, WsUser, extractTokenFromSocket } from '@/chat/ws-jwt.guard';

@Injectable()
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,https://www.homerunnie.app').split(
      ',',
    ),
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly memberRepository: MemberRepository,
    private readonly chatRepository: ChatRepository,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = extractTokenFromSocket(socket);
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const result = await this.memberRepository.findMemberWithProfile(payload.memberId);
      const profile = result[0]?.profile;

      if (!profile) {
        socket.disconnect();
        return;
      }

      socket.data.user = {
        memberId: payload.memberId,
        nickname: profile.nickname,
        roomIds: new Set<string>(),
      } satisfies WsSocketUser;

      socket.emit('authenticated');
      this.logger.log(`client connected: ${profile.nickname} (${socket.id})`);
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`client disconnected: ${socket.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @WsUser() user: WsSocketUser,
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId } = data;
    const { nickname } = user;
    const chatRoomId = parseInt(roomId, 10);

    socket.join(roomId);
    user.roomIds.add(roomId);

    const history = await this.chatRepository.findMessagesByRoomId(chatRoomId);
    socket.emit(
      'message_history',
      history.map((msg) => ({
        id: msg.id,
        message: msg.content,
        isOwn: msg.senderId === user.memberId,
        nickname: msg.nickname,
        createdAt: msg.createdAt,
      })),
    );

    this.logger.log(`${nickname} joined room ${roomId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @WsUser() user: WsSocketUser,
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const { message, roomId } = data;

    if (!user.roomIds.has(roomId)) return;

    const { nickname, memberId } = user;
    const chatRoomId = parseInt(roomId, 10);

    await Promise.all([
      this.chatRepository.saveMessage(chatRoomId, memberId, message),
      this.chatRepository.updateChatRoomUpdatedAt(chatRoomId),
    ]);

    socket.to(roomId).emit('received_message', { nickname, message, isOwn: false, roomId });
    socket.emit('received_message', { nickname, message, isOwn: true, roomId });
  }

  emitToRoom(roomId: string, event: string, data: unknown) {
    this.server.to(roomId).emit(event, data);
  }

  emitJoinRequestReceived(roomId: string, data: unknown) {
    this.server.to(roomId).emit('join_request_received', data);
  }

  emitMemberJoined(roomId: string, data: unknown) {
    this.server.to(roomId).emit('member_joined', data);
  }

  emitJoinRequestRejected(roomId: string, data: unknown) {
    this.server.to(roomId).emit('join_request_rejected', data);
  }

  emitMemberKicked(roomId: string, data: unknown) {
    this.server.to(roomId).emit('member_kicked', data);
  }

  emitRoomDeleted(roomId: string) {
    this.server.to(roomId).emit('room_deleted', { roomId });
  }
}
