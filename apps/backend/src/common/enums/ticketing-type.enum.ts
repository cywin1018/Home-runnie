export enum TicketingType {
  SEPARATE = 'SEPARATE',
  TOGETHER = 'TOGETHER',
}

export const TicketingTypeDescription = {
  [TicketingType.SEPARATE]: '각자 예매',
  [TicketingType.TOGETHER]: '함께 예매',
} as const;
