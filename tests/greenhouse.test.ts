import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { greenhouseObstacles, greenhousePlaces } from '../src/data/greenhouseRegion';
import { gardenNavigation, regions } from '../src/data/regions';
import { findPath } from '../src/engine/navigation';
import { defaultAppearance } from '../src/game/appearance';
import { coinRule, purchaseCosmetic, reconcileCoins } from '../src/game/coinEconomy';
import { importBackup, initialGame, makeBackup } from '../src/game/gameState';
import { greenhouseTransition, initialGreenhouse, parseGreenhouse, type HeatEvent } from '../src/game/greenhouseMission';
import { capacityJK, durationS, formatC, heatCases, heatSetups, initialC, meetsHeatTarget, sampleHeat, sampleTimes, temperatureC, type HeatCase } from '../src/game/greenhouseModel';
import { GreenhouseSession, expectedPrediction } from '../src/game/greenhouseSession';

function exercise() {
  const session = new GreenhouseSession();
  let p = initialGreenhouse();
  const send = (event: HeatEvent) => {
    const result = greenhouseTransition(p, event, session);
    p = result.progress;
    return result.ok;
  };
  function prepare() {
    expect(send({ type: 'accept' })).toBe(true);
    expect(send({ type: 'read', source: 'book' })).toBe(true);
    expect(send({ type: 'read', source: 'notes' })).toBe(true);
    expect(send({ type: 'check' })).toBe(false);
    expect(send({ type: 'borrow' })).toBe(true);
    expect(send({ type: 'baseline', location: 'inside' })).toBe(false);
    expect(send({ type: 'check' })).toBe(true);
    expect(send({ type: 'baseline', location: 'inside' })).toBe(true);
    expect(send({ type: 'baseline', location: 'outside' })).toBe(true);
  }
  function configure(key: HeatCase) {
    session.prepare();
    const setup = heatSetups[key];
    expect(session.setShade(setup.shade)).toBe(true);
    expect(session.setUnlocked(true)).toBe(true);
    expect(session.setVent(setup.vent)).toBe(true);
  }
  const report = (comparison = 'one-factor', solution = 'combined') =>
    send({ type: 'report', comparison, solution, reflection: '🌱' });
  function recordAll() {
    for (const key of heatCases) {
      configure(key);
      session.predict(expectedPrediction(key));
      session.advance(durationS);
      session.observe();
      expect(send({ type: 'record' })).toBe(true);
    }
  }
  return { session, get progress() { return p; }, send, prepare, configure, report, recordAll };
}

describe('M03 thermal model', () => {
  it.each([['A', '55,9'], ['B', '43,0'], ['C', '40,0'], ['D', '35,0']] as const)('computes readings for %s on the common schedule', (key, formatted) => {
    const values = sampleHeat(key);
    expect(values).toHaveLength(sampleTimes.length);
    expect(values[0]).toBe(30);
    expect(formatC(values.at(-1)!)).toBe(formatted + ' °C');
    expect(meetsHeatTarget(values.at(-1)!)).toBe(key === 'D');
  });
  it('uses watts and J/K, preserves the fair comparisons, and checks the unrounded target', () => {
    expect((temperatureC(heatSetups.A, .001) - initialC) / .001).toBeCloseTo(600 / capacityJK, 6);
    expect((temperatureC(heatSetups.B, .001) - initialC) / .001).toBeCloseTo(300 / capacityJK, 6);
    expect(heatSetups.A.vent).toBe(heatSetups.B.vent);
    expect(heatSetups.A.shade).toBe(heatSetups.C.shade);
    expect(sampleHeat('D').at(-1)).toBeLessThan(35);
    expect(formatC(35.001)).toBe('35,0 °C');
    expect(meetsHeatTarget(35.001)).toBe(false);
  });
  it('has equivalent outcomes for different step sizes and analytical composition', () => {
    const { session, configure } = exercise();
    for (const key of heatCases) {
      configure(key);
      expect(session.temperature).toBe(initialC);
      session.predict('same');
      for (let i = 0; i < 86; i++) session.advance(7);
      expect(session.seconds).toBe(durationS);
      expect(session.temperature).toBe(sampleHeat(key).at(-1));
      const halfway = temperatureC(heatSetups[key], 300);
      expect(temperatureC(heatSetups[key], 300, halfway)).toBeCloseTo(session.temperature, 12);
    }
  });
});

describe('M03 evidence and storage', () => {
  it('needs real setup and observation, retains the wrong prediction, and cancels without evidence', () => {
    const lab = exercise(), s = lab.session;
    expect(s.setVent(true)).toBe(false);
    lab.prepare();
    lab.configure('D');
    s.predict('less'); s.advance(600); s.observe();
    expect(lab.send({ type: 'record' })).toBe(false);
    lab.configure('A');
    expect(s.predict('same')).toBe(true);
    expect(s.predict('more')).toBe(false);
    expect(s.setShade(true)).toBe(false);
    expect(s.setVent(true)).toBe(false);
    s.advance(120);
    expect(s.correct('more')).toBe(false);
    expect(lab.send({ type: 'record' })).toBe(false);
    s.prepare();
    expect(s.temperature).toBe(30);
    expect(lab.progress.records).toEqual([]);
    s.predict('same'); s.advance(600);
    expect(lab.send({ type: 'record' })).toBe(false);
    s.observe();
    expect(s.correct('more')).toBe(true);
    expect(lab.send({ type: 'record' })).toBe(true);
    expect(lab.send({ type: 'record' })).toBe(false);
    expect(lab.progress.records).toEqual([{ key: 'A', prediction: 'same', correction: 'more' }]);
    expect(lab.report()).toBe(false);
    s.recover();
    expect(s).toMatchObject({ shade: false, vent: false, unlocked: false, prediction: null, seconds: 0 });
  });
  it('requires the installed solution and valid conclusion; rejects impossible evidence on import', () => {
    const lab = exercise();
    lab.prepare();
    lab.recordAll();
    lab.configure('C');
    expect(lab.report()).toBe(false);
    lab.configure('D');
    expect(lab.report('both')).toBe(false);
    expect(lab.report('one-factor', 'universal')).toBe(false);
    expect(lab.report()).toBe(true);
    const completed = lab.progress;
    expect(lab.report()).toBe(true);
    expect(lab.progress).toBe(completed);
    expect(parseGreenhouse(completed)).toEqual(completed);
    expect(() => parseGreenhouse({ ...completed, conclusion: null })).toThrow('M03');
    const invalid = structuredClone(completed);
    invalid.records.reverse();
    expect(() => parseGreenhouse(invalid)).toThrow('M03');
    expect(() => parseGreenhouse({ ...completed, rewardProof: initialGreenhouse() })).toThrow('M03');
  });
  it('preserves M14, purchases and appearance across M03 reward, legacy import and reset', () => {
    const lab = exercise();
    lab.prepare();
    lab.recordAll();
    lab.report();
    const raw = JSON.parse(readFileSync(new URL('./fixtures/coin-wallet-stage7.json', import.meta.url), 'utf8'));
    const game = importBackup(raw, initialGame()).game;
    game.economy = purchaseCosmetic(game.economy!, 'outfit-field', 1).economy;
    game.appearance = { ...(game.appearance ?? defaultAppearance()), outfit: 'outfit-field' };
    const legacy = makeBackup(game);
    const { M03: _omitted, ...missions } = legacy.missions;
    const v20 = { ...legacy, missions, version: 20 };
    const other = structuredClone(game.M14);
    game.M03 = lab.progress;
    const granted = reconcileCoins(game.economy, game, 'mission-completion');
    game.economy = granted.economy;
    expect(coinRule('M03')?.coins).toBe(100);
    expect(granted.grants.map(x => x.missionId)).toEqual(['M03']);
    expect(importBackup(v20, game).game.M03).toEqual(game.M03);
    const current = makeBackup(game);
    expect(current.version).toBe(21);
    expect(importBackup(current, initialGame()).game).toEqual(game);
    lab.send({ type: 'reset' });
    const reset = { ...game, M03: lab.progress };
    expect(reset.M03).toMatchObject({ accepted: false, completed: false, reward: 100, records: [] });
    expect(importBackup(makeBackup(reset), reset).game).toEqual(reset);
    expect(importBackup(legacy, game).game.M03).toMatchObject({ completed: false, reward: 100 });
    expect(reconcileCoins(reset.economy, reset, 'mission-completion').grants).toEqual([]);
    expect(reset.M14).toEqual(other);
    expect(reset.economy?.owned).toEqual(['outfit-field']);
    expect(reset.appearance?.outfit).toBe('outfit-field');
    for (const id of ['S02', 'S04', 'S20']) expect(Object.hasOwn(current.missions, id)).toBe(false);
  });
  it('keeps each added station and each M14 destination reachable', () => {
    expect(greenhouseObstacles).toHaveLength(5);
    for (const p of regions.garden.places) {
      const approach = { x: p.x, z: p.z + 1.4 };
      expect(findPath(regions.garden.spawn, approach, gardenNavigation).length, p.id).toBeGreaterThan(0);
      if (greenhousePlaces.some(heat => heat.id === p.id))
        expect(findPath(approach, { x: -5, z: 8.4 }, gardenNavigation).length, p.id).toBeGreaterThan(0);
    }
  });
});
