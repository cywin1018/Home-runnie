import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, count } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/common';
import { ChatRoom, ChatRoomMember, ChatMessage } from '@/chat/domain';
import { ChatRoomMemberRole } from '@homerunnie/shared';
import * as schema from '@/common/db/schema';

type ChatRoomType = typeof ChatRoom.$inferSelect;
type ChatRoomMemberType = typeof ChatRoomMember.$inferSelect;
type DbType = NodePgDatabase<typeof schema>;
type DbTransaction = Parameters<Parameters<DbType['transaction']>[0]>[0];

@Injectable()
export class ChatRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DbType,
  ) {}

  async createChatRoom(postId: number, tx?: DbTransaction): Promise<ChatRoomType> {
    const executor = tx || this.db;
    const [chatRoom] = await executor.insert(ChatRoom).values({ postId }).returning();

    return chatRoom;
  }

  async createChatRoomMember(
    chatRoomId: number,
    memberId: number,
    role: ChatRoomMemberRole,
    tx?: DbTransaction,
  ): Promise<ChatRoomMemberType> {
    const executor = tx || this.db;
    const [member] = await executor
      .insert(ChatRoomMember)
      .values({ chatRoomId, memberId, role })
      .returning();

    return member;
  }

  async findChatRoomsByMemberId(
    memberId: number,
    page: number,
    limit: number,
  ): Promise<ChatRoomType[]> {
    const offset = (page - 1) * limit;

    const chatRooms = await this.db
      .select({
        id: ChatRoom.id,
        postId: ChatRoom.postId,
        createdAt: ChatRoom.createdAt,
        updatedAt: ChatRoom.updatedAt,
        deleted: ChatRoom.deleted,
      })
      .from(ChatRoom)
      .innerJoin(ChatRoomMember, eq(ChatRoom.id, ChatRoomMember.chatRoomId))
      .where(and(eq(ChatRoomMember.memberId, memberId), eq(ChatRoom.deleted, false)))
      .orderBy(desc(ChatRoom.updatedAt))
      .limit(limit)
      .offset(offset);

    return chatRooms;
  }

  async countChatRoomsByMemberId(memberId: number): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(ChatRoom)
      .innerJoin(ChatRoomMember, eq(ChatRoom.id, ChatRoomMember.chatRoomId))
      .where(and(eq(ChatRoomMember.memberId, memberId), eq(ChatRoom.deleted, false)));

    return result[0]?.count || 0;
  }

  async findChatRoomById(chatRoomId: number): Promise<ChatRoomType | null> {
    const [chatRoom] = await this.db
      .select()
      .from(ChatRoom)
      .where(and(eq(ChatRoom.id, chatRoomId), eq(ChatRoom.deleted, false)));

    return chatRoom || null;
  }

  async saveMessage(chatRoomId: number, senderId: number, content: string) {
    const [message] = await this.db
      .insert(ChatMessage)
      .values({ chatRoomId, senderId, content })
      .returning();

    return message;
  }

  async findMessagesByRoomId(chatRoomId: number, limit = 50) {
    const messages = await this.db
      .select({
        id: ChatMessage.id,
        content: ChatMessage.content,
        senderId: ChatMessage.senderId,
        createdAt: ChatMessage.createdAt,
      })
      .from(ChatMessage)
      .where(eq(ChatMessage.chatRoomId, chatRoomId))
      .orderBy(desc(ChatMessage.createdAt))
      .limit(limit);

    return messages.reverse();
  }
}
