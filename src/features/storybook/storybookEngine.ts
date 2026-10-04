// Storybook Engine — Public API
// Updated to use the real engine pipeline while maintaining backward compatibility.

import { Storybook } from '../../types';
import { EngineInput } from './engine/types';
import { generateStorybook } from './engine';

export { generateStorybook } from './engine';
export type { EngineInput, GeneratedStorybook } from './engine/types';

/**
 * Build a premium storybook from raw event data.
 * Uses the full engine pipeline: media scoring → timeline → route → curation → insights → copy → theme → quality.
 */
export async function buildPremiumStorybook(input: {
  event: EngineInput['event'];
  media: EngineInput['media'];
  locations: EngineInput['locations'];
  captions?: EngineInput['captions'];
  friendQuotes?: Array<{ name: string; text: string }>;
  theme?: EngineInput['theme'];
  privacySettings?: EngineInput['privacySettings'];
}): Promise<Storybook> {
  const engineInput: EngineInput = {
    event: input.event,
    media: input.media,
    locations: input.locations,
    captions: input.captions ?? (input.friendQuotes ?? []).map((q, i) => ({
      id: `caption_${i}`,
      name: q.name,
      text: q.text,
      createdAt: input.event.startsAt,
    })),
    theme: input.theme ?? 'cinematic',
    privacySettings: input.privacySettings ?? {
      blurPrivateLocations: true,
      shareSafeMode: false,
    },
  };

  const result = await generateStorybook(engineInput);
  return result.storybook;
}
