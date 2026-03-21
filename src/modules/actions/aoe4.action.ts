import fetch from "node-fetch";
import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { eq } from "drizzle-orm";
import { formatCiv } from "../../utils/format.ts";

import type { MatchSummaryResult, Player } from "../workers/types.ts";

const MAX_JOB_RETRIES = 5;

export async function aoe4MatchSummaryAction(payload: any, job: any) {
  const matchId = payload?.matchId;
  const profileId = payload?.profileId;
  if (!matchId || !profileId) {
    throw new Error("Invalid payload");
  }

  let apiData: any;
  try {
    const response = await fetch(`https://aoe4world.com/api/v0/players/${profileId}/games/${matchId}`);
    if (!response.ok) {
      throw new Error("Match not ready");
    }
    apiData = await response.json();

  } catch {
    const newAttempts = job.attempts + 1;

    if (newAttempts >= MAX_JOB_RETRIES) {
      await db.update(jobs).set({ status: "failed", attempts: newAttempts }).where(eq(jobs.id, job.id));
    } else {
      await db.update(jobs).set({ status: "pending", attempts: newAttempts }).where(eq(jobs.id, job.id));
    }
    return null;
  }

  const teams = apiData?.teams || [];

  const players: Player[] = teams.flat().map((p: any) => ({
    name: p.name,
    result: p.result,
    civilization: p.civilization,
  }));

  const winner = players.find(p => p.result === "win");
  const loser = players.find(p => p.result === "loss");

  const durationMinutes = Math.round(apiData.duration / 60);

  const result: MatchSummaryResult = {
    matchId,
    map: apiData.map,
    duration: `${durationMinutes} minutes`,
    players,
    summary: winner && loser
      ? `${winner.name} (${formatCiv(winner.civilization)}) defeated ${loser.name} (${formatCiv(loser.civilization)}) on ${apiData.map} in ${durationMinutes} minutes`
      : `Match ${matchId} processed`
  };
  return result;
}