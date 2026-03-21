import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, count } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/common';
import { ChatRoom, ChatRoomMember, ChatMessage, ChatJoinRequest } from '@/chat/domain';
import { ChatRoomMemberRole, ChatJoinRequestStatus } from '@homerunnie/shared';
import { Member } from '@/member/domain/member.entity';
import { Profile } from '@/member/domain/profile.entity';
import { Post } from '@/post/domain';
import { RecruitmentDetail } from '@/post/domain/recruitment-detail.entity';
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

  async findChatRoomsByMemberId(memberId: number, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const chatRooms = await this.db
      .select({
        id: ChatRoom.id,
        postId: ChatRoom.postId,
        postTitle: Post.title,
        createdAt: ChatRoom.createdAt,
        updatedAt: ChatRoom.updatedAt,
        deleted: ChatRoom.deleted,
        role: ChatRoomMember.role,
        teamHome: RecruitmentDetail.teamHome,
        teamAway: RecruitmentDetail.teamAway,
        gameDate: RecruitmentDetail.gameDate,
      })
      .from(ChatRoom)
      .innerJoin(ChatRoomMember, eq(ChatRoom.id, ChatRoomMember.chatRoomId))
      .leftJoin(Post, eq(ChatRoom.postId, Post.id))
      .leftJoin(RecruitmentDetail, eq(Post.id, RecruitmentDetail.postId))
      .where(
        and(
          eq(ChatRoomMember.memberId, memberId),
          eq(ChatRoom.deleted, false),
          eq(ChatRoomMember.deleted, false),
        ),
      )
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
      .where(
        and(
          eq(ChatRoomMember.memberId, memberId),
          eq(ChatRoom.deleted, false),
          eq(ChatRoomMember.deleted, false),
        ),
      );

    return result[0]?.count || 0;
  }

  async findChatRoomByPostId(postId: number): Promise<ChatRoomType | null> {
    const [chatRoom] = await this.db
      .select()
      .from(ChatRoom)
      .where(and(eq(ChatRoom.postId, postId), eq(ChatRoom.deleted, false)));

    return chatRoom || null;
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

  async findChatRoomMember(chatRoomId: number, memberId: number) {
    const [member] = await this.db
      .select()
      .from(ChatRoomMember)
      .where(
        and(
          eq(ChatRoomMember.chatRoomId, chatRoomId),
          eq(ChatRoomMember.memberId, memberId),
          eq(ChatRoomMember.deleted, false),
        ),
      );

    return member || null;
  }

  async findChatRoomMembersByRoomId(chatRoomId: number) {
    const members = await this.db
      .select({
        memberId: ChatRoomMember.memberId,
        role: ChatRoomMember.role,
        nickname: Profile.nickname,
      })
      .from(ChatRoomMember)
      .innerJoin(Profile, eq(ChatRoomMember.memberId, Profile.memberId))
      .where(and(eq(ChatRoomMember.chatRoomId, chatRoomId), eq(ChatRoomMember.deleted, false)));

    return members;
  }

  async softDeleteChatRoomMember(chatRoomId: number, memberId: number) {
    const [updated] = await this.db
      .update(ChatRoomMember)
      .set({ deleted: true })
      .where(
        and(
          eq(ChatRoomMember.chatRoomId, chatRoomId),
          eq(ChatRoomMember.memberId, memberId),
          eq(ChatRoomMember.deleted, false),
        ),
      )
      .returning();

    return updated || null;
  }

  async softDeleteChatRoom(chatRoomId: number) {
    const [updated] = await this.db
      .update(ChatRoom)
      .set({ deleted: true })
      .where(eq(ChatRoom.id, chatRoomId))
      .returning();

    return updated || null;
  }

  async createJoinRequest(chatRoomId: number, memberId: number) {
    const [request] = await this.db
      .insert(ChatJoinRequest)
      .values({
        chatRoomId,
        memberId,
        status: ChatJoinRequestStatus.PENDING,
      })
      .returning();

    return request;
  }

  async findPendingJoinRequests(chatRoomId: number) {
    const requests = await this.db
      .select({
        id: ChatJoinRequest.id,
        memberId: ChatJoinRequest.memberId,
        chatRoomId: ChatJoinRequest.chatRoomId,
        status: ChatJoinRequest.status,
        createdAt: ChatJoinRequest.createdAt,
        nickname: Profile.nickname,
        gender: Member.gender,
        birthDate: Member.birthDate,
      })
      .from(ChatJoinRequest)
      .innerJoin(Profile, eq(ChatJoinRequest.memberId, Profile.memberId))
      .innerJoin(Member, eq(ChatJoinRequest.memberId, Member.id))
      .where(
        and(
          eq(ChatJoinRequest.chatRoomId, chatRoomId),
          eq(ChatJoinRequest.status, ChatJoinRequestStatus.PENDING),
          eq(ChatJoinRequest.deleted, false),
        ),
      )
      .orderBy(desc(ChatJoinRequest.createdAt));

    return requests;
  }

  async findJoinRequestById(requestId: number) {
    const [request] = await this.db
      .select()
      .from(ChatJoinRequest)
      .where(eq(ChatJoinRequest.id, requestId));

    return request || null;
  }

  async updateJoinRequestStatus(requestId: number, status: ChatJoinRequestStatus) {
    const [updated] = await this.db
      .update(ChatJoinRequest)
      .set({ status })
      .where(eq(ChatJoinRequest.id, requestId))
      .returning();

    return updated || null;
  }

  async findExistingJoinRequest(chatRoomId: number, memberId: number) {
    const [request] = await this.db
      .select()
      .from(ChatJoinRequest)
      .where(
        and(
          eq(ChatJoinRequest.chatRoomId, chatRoomId),
          eq(ChatJoinRequest.memberId, memberId),
          eq(ChatJoinRequest.status, ChatJoinRequestStatus.PENDING),
          eq(ChatJoinRequest.deleted, false),
        ),
      );

    return request || null;
  }
}
