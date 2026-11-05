/**
 * S143/CR5 — the sequence-ticket CAS (the true fetchSeq idiom, extracted).
 *
 * The S142/CQ7 appearance-pickers' rollback guard compared VALUES ("the
 * store still equals the failed `next`"), citing the fetchSeq idiom —
 * but fetchSeq compares a REQUEST SEQUENCE, not a value. The same-value
 * ABA the value-compare cannot see: pick(A) at t0 (PATCH1 in flight),
 * pick(A) again at t1 (prev=A), PATCH1 fails at t2 → the store holds
 * A === next → the guard rolls back to the ORIGINAL prev, clobbering
 * the second pick's optimism while its own PATCH (presumably) succeeds —
 * store and server diverge until the next /api/auth/me hydration.
 *
 * The fix: per-field sequence tickets. Each picker holds one guard;
 * `begin()` mints a monotonically increasing ticket at the pick; the
 * PATCH's catch rolls back ONLY when `isCurrent(ticket)` — i.e. when NO
 * NEWER pick (any value, same or different) was issued after ours. A
 * value never enters the comparison, so the ABA closes. Unit-pinned in
 * tests/fetch-seq.test.ts (the picker call sites carry the
 * script-conventions census markers).
 */
export interface FetchSeq {
  /** Mint the next ticket (call at the moment the optimistic pick lands). */
  begin(): number;
  /** True when NO newer ticket was minted after `ticket` (the catch's
   * rollback condition — a stale failure must not clobber a newer pick). */
  isCurrent(ticket: number): boolean;
}

export function createFetchSeq(): FetchSeq {
  let seq = 0;
  return {
    begin(): number {
      seq += 1;
      return seq;
    },
    isCurrent(ticket: number): boolean {
      return ticket === seq;
    },
  };
}
