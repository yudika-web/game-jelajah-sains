import { terminals, type Terminal } from '../data/workshopContent';
export interface CircuitState { sourceConnected: boolean; switchClosed: boolean; repaired: boolean; }
export const circuitSpecification = { sourceV: 3, lampV: 3 } as const;
export const isTerminal = (value: unknown): value is Terminal => typeof value === 'string' && Object.hasOwn(terminals, value);
export function connectionResult(a: Terminal, b: Terminal): 'correct'|'short'|'wrong' {
  if ((a === 'B+' && b === 'B-') || (a === 'B-' && b === 'B+')) return 'short';
  return [a,b].includes('S2') && [a,b].includes('L1') ? 'correct' : 'wrong';
}
/** One model feeds the journal diagram and the actual research-post lamp. */
export function evaluateCircuit(p: CircuitState) {
  const edges: [Terminal,Terminal][] = [['B+','S1'],['L2','B-']];
  if (p.switchClosed) edges.push(['S1','S2']);
  if (p.repaired) edges.push(['S2','L1']);
  const reachable = (start:Terminal,end:Terminal) => {
    const seen = new Set<Terminal>([start]), queue=[start];
    for (const current of queue) for (const [a,b] of edges) {
      const next = a === current ? b : b === current ? a : null;
      if(next && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
    return seen.has(end);
  };
  const complete = reachable('B+','L1') && reachable('L2','B-');
  return { edges, complete, lampOn: p.sourceConnected && complete && circuitSpecification.sourceV === circuitSpecification.lampV, voltage: circuitSpecification.sourceV };
}
