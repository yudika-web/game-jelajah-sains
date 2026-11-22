export const outsideC = 30;
export const initialC = 30;
export const capacityJK = 6000;
export const targetC = 35;
export const durationS = 600;
export const sampleTimes = [0, 120, 240, 360, 480, durationS] as const;

export interface HeatSetup { shade: boolean; vent: boolean }
export const heatSetups = {
  A: { shade: false, vent: false },
  B: { shade: true, vent: false },
  C: { shade: false, vent: true },
  D: { shade: true, vent: true },
} as const satisfies Record<string, HeatSetup>;
export type HeatCase = keyof typeof heatSetups;
export const heatCases = ['A', 'B', 'C', 'D'] as const;
export const heatLabels: Record<HeatCase, string> = {
  A: 'Tanpa peneduh · tertutup',
  B: 'Peneduh · tertutup',
  C: 'Tanpa peneduh · terbuka',
  D: 'Peneduh · terbuka',
};

export function temperatureC(setup: HeatSetup, seconds: number, startC = initialC) {
  const inputW = setup.shade ? 300 : 600;
  const lossWK = setup.vent ? 60 : 20;
  const equilibriumC = outsideC + inputW / lossWK;
  return startC + (equilibriumC - startC) * -Math.expm1(-lossWK * seconds / capacityJK);
}

export const sampleHeat = (key: HeatCase) => sampleTimes.map(t => temperatureC(heatSetups[key], t));
export const meetsHeatTarget = (celsius: number) => celsius <= targetC;
const decimalC = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const formatC = (celsius: number) => decimalC.format(celsius) + ' °C';
