import { describe, it, expect } from 'vitest';
import { initialProgress, transition, parseProgress, type MissionEvent, type Progress } from '../src/game/mission';

function act(p: Progress, e: MissionEvent) { return transition(p, e).progress; }
function evidence() {
  let p = act(initialProgress(), { type: 'accept' });
  for (const e of [
    { type: 'hypothesis' }, { type: 'read', source: 'book' }, { type: 'read', source: 'rain' },
    { type: 'plan', tool: 'turbidity', variable: 'location', control: 'rain' },
    { type: 'measure', sample: 'A' }, { type: 'measure', sample: 'B' },
  ] as MissionEvent[]) p = act(p, e);
  return p;
}
describe('M01: evidence, controlled trial, and bounded conclusions', () => {
  it('does not let a correct guess bypass evidence or the trial', () => {
    expect(transition(initialProgress(), { type: 'conclude', answer: 'sediment' }).ok).toBe(false);
    expect(transition(evidence(), { type: 'conclude', answer: 'sediment' }).ok).toBe(false);
  });
  it('requires correct tool, variable, and controls before measurement', () => {
    let p = act(initialProgress(), { type: 'accept' });
    expect(transition(p, { type: 'measure', sample: 'A' }).ok).toBe(false);
    p = act(p, { type: 'plan', tool: 'thermometer', variable: 'location', control: 'rain' });
    expect(p.plan).toBe(false);
    expect(transition(p, { type: 'plan', tool: 'turbidity', variable: 'bottle', control: 'rain' }).ok).toBe(false);
    expect(transition(p, { type: 'plan', tool: 'turbidity', variable: 'location', control: 'different' }).ok).toBe(false);
  });
  it('records separate A=70 and B=20 in the same simulated session', () => {
    const p = evidence();
    expect(p.samples.A).toEqual({ value: 70, session: 'hujan-0900' });
    expect(p.samples.B).toEqual({ value: 20, session: 'hujan-0900' });
  });
  it.each(['hypothesis', 'book', 'rain', 'A', 'B'])('requires evidence %s for the sediment trial', missing => {
    const p = evidence();
    if (missing === 'hypothesis') p.hypothesis = false;
    if (missing === 'book' || missing === 'rain') p.sources[missing] = false;
    if (missing === 'A' || missing === 'B') delete p.samples[missing];
    expect(transition(p, { type: 'trial' }).ok).toBe(false);
  });
  it('retains wrong first attempts and allows scientific correction', () => {
    let p = act(evidence(), { type: 'trial' });
    expect(p.trial).toBe(35);
    for (const answer of ['drink', 'waste']) {
      const r = transition(p, { type: 'conclude', answer });
      expect(r.ok).toBe(false); p = r.progress;
      expect(p.completed).toBe(false);
    }
    p = act(p, { type: 'conclude', answer: 'sediment' });
    expect(p.completed).toBe(true);
    expect(p.attempts.map(a => a.correct)).toEqual([false, false, true]);
  });
  it('never duplicates bottles or rewards on replay and reload', () => {
    let p = act(act(evidence(), { type: 'trial' }), { type: 'conclude', answer: 'sediment' });
    for (let i = 0; i < 3; i++) {
      p = parseProgress(JSON.parse(JSON.stringify(p)));
      p = act(p, { type: 'measure', sample: 'A' });
      p = act(p, { type: 'conclude', answer: 'sediment' });
    }
    expect(p.reward).toBe(100); expect(p.attempts).toHaveLength(1);
    expect(Object.keys(p.samples)).toHaveLength(2);
  });
  it('rejects corrupt or inconsistent imported saves', () => {
    for (const raw of [null, {}, { ...evidence(), version: 2 }, { ...initialProgress(), completed: true, reward: 100 },
      { ...evidence(), samples: { A: { value: 0, session: 'hujan-0900' } } },
      { ...initialProgress(), attempts: [{ answer: 'drink', correct: true }] },
      { ...initialProgress(), savedAt: '<script>bad</script>' }]) expect(() => parseProgress(raw)).toThrow();
    expect(parseProgress(evidence())).toEqual(evidence());
  });
  it('does not mutate the caller state', () => {
    const p = evidence(); const original = structuredClone(p);
    act(p, { type: 'trial' }); expect(p).toEqual(original);
  });
});
