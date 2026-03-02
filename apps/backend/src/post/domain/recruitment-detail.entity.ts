import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from '@/common';
import { relations } from 'drizzle-orm';
import { Post } from '@/post/domain/post.entity';
import { Participation } from '@/participation/domain';
import { preferGenderPgEnum, ticketingTypePgEnum } from '@/common';

export { preferGenderPgEnum, ticketingTypePgEnum };

export const RecruitmentDetail = pgTable('recruitment_detail', {
  ...baseColumns,
  gameDate: timestamp('game_date', { mode: 'string' }).notNull(),
  gameTime: timestamp('game_time', { mode: 'string' }).notNull(),
  stadium: text('stadium').notNull(),
  teamHome: text('team_home').notNull(),
  teamAway: text('team_away').notNull(),
  supportTeam: text('support_team'),
  recruitmentLimit: integer('recruitment_limit').notNull().default(1),
  currentParticipants: integer('current_participants').notNull().default(0),
  preferGender: preferGenderPgEnum('prefer_gender').notNull().default('ANY'),
  picked: text('picked').array(),
  message: text('message'),
  ticketingType: ticketingTypePgEnum('ticketing_type'),
  postId: integer('post_id')
    .notNull()
    .unique()
    .references(() => Post.id),
});

export const recruitmentDetailsRelations = relations(RecruitmentDetail, ({ one, many }) => ({
  post: one(Post, {
    fields: [RecruitmentDetail.postId],
    references: [Post.id],
  }),
  participation: many(Participation),
}));
