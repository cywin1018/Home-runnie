export type PickedTagOption = {
  label: string;
  value: string;
};

export const PICKED_TAG_OPTIONS: PickedTagOption[] = [
  { label: '응원가 부르는거 좋아해요', value: 'CHEER_SONG' },
  { label: '구경', value: 'SIGHTSEEING' },
  { label: '테이블', value: 'TABLE_SEAT' },
  { label: '경기보면서 맛있는거 먹기', value: 'EAT_FOOD' },
  { label: '응원석이 가까이 있는게 좋아요', value: 'CHEER_SEAT_NEAR_GOOD' },
  { label: '응원석이 가까이 있는거 싫어요', value: 'CHEER_SEAT_NEAR_BAD' },
  { label: '햇빛 좋아요', value: 'SUN_GOOD' },
  { label: '햇빛 싫어요', value: 'SUN_BAD' },
  { label: '사진', value: 'PHOTO' },
  { label: '외야도', value: 'OUTFIELD' },
  { label: '선수 가까이', value: 'CLOSE_TO_PLAYER' },
];

const DISPLAY_TO_API = new Map(PICKED_TAG_OPTIONS.map((option) => [option.label, option.value]));
const API_TO_DISPLAY = new Map(PICKED_TAG_OPTIONS.map((option) => [option.value, option.label]));

export const toPickedApiValues = (values?: string[] | null): string[] => {
  if (!values?.length) return [];
  return values.map((value) => DISPLAY_TO_API.get(value) ?? value);
};

export const toPickedDisplayValues = (values?: string[] | null): string[] => {
  if (!values?.length) return [];
  return values.map((value) => API_TO_DISPLAY.get(value) ?? value);
};
