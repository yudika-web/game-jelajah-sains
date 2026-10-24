/** World units are approximately metres. Heights include hair/hats, never labels/tools. */
export const characterConfig = {
  heights: { explorer: 1.60, explorerGirl: 1.60, nara: 1.70, wira: 1.75, sari: 1.68, damar:1.74, lestari:1.68, bima:1.72 },
  groundY: .10,
  cameraTargetHeight: 1.02,
  labelGap: .30,
  interactionRadius: 2.6,
  navigationRadius: .45,
} as const;
export const environmentDimensions = {
  door: { width: 1.1, height: 2.1 },
  benchSeat: .50,
  gardenTableTop: .84,
} as const;
export function playerVariant(value: string | null): 'explorer' | 'explorerGirl' {
  return value === 'siswi' ? 'explorerGirl' : 'explorer';
}
