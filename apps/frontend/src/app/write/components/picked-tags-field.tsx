'use client';

import { BgmTag } from '@/shared/ui/tag/bgm-tag';
import { PICKED_TAG_OPTIONS, toPickedApiValues } from '@/shared/constants/picked-tags';

interface PickedTagsFieldProps {
  value?: string[] | null;
  onChange: (next: string[]) => void;
}

export default function PickedTagsField({ value, onChange }: PickedTagsFieldProps) {
  const normalizedValue = toPickedApiValues(value);

  const toggleTag = (apiValue: string) => {
    const next = normalizedValue.includes(apiValue)
      ? normalizedValue.filter((item) => item !== apiValue)
      : [...normalizedValue, apiValue];

    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {PICKED_TAG_OPTIONS.slice(0, 5).map((option) => (
          <BgmTag
            key={option.value}
            text={option.label}
            selected={normalizedValue.includes(option.value)}
            onClick={() => toggleTag(option.value)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {PICKED_TAG_OPTIONS.slice(5).map((option) => (
          <BgmTag
            key={option.value}
            text={option.label}
            selected={normalizedValue.includes(option.value)}
            onClick={() => toggleTag(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
