import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { eq } from "drizzle-orm";
import { formatCiv } from "../../utils/format.ts";

const MAX_JOB_RETRIES = 5;

export async function aoe4MetaAction(payload: any, job: any) {
    // 2 appracohes by mapName or (matchId & profileID)
    let mapName = payload?.map;
    if(!mapName){
        const matchId = payload?.matchId;
        const profileId = payload?.profileId;
        if(!matchId || !profileId) {
            throw new Error("Provide either map OR matchId + profileId");
        }
        try {
            const res = await fetch(`https://aoe4world.com/api/v0/players/${profileId}/games/${matchId}`)
            if(!res.ok){
                throw new Error("Match not ready");
            }
            const matchData = await res.json();
            mapName = matchData?.map;
        }
        catch {
            const newAttempts = job.attempts + 1 ;
            if(newAttempts >= MAX_JOB_RETRIES) {
                await db.update(jobs).set({ status: "failed", attempts: newAttempts })
                .where(eq(jobs.id, job.id));
            }else{
                await db.update(jobs).set({status: "pending", attempts: newAttempts})
                .where(eq(jobs.id ,job.id))
            }
            return null;
        }
    }
    let statsData: any;
    try{
        const res = await fetch(`https://aoe4world.com/api/v0/stats/rm_solo/maps?include_civs=true`)
        if(!res.ok){
            throw new Error("Stats fetch failed");
        }
        statsData = await res.json();
    }catch(err){
        console.error("Stats API failed", err);
        return {
            map: mapName,
            summary: `No meta data available for ${mapName}`
        }
    }
    const mapStats = statsData?.maps?.find(
        (m: any) => m.name?.toLowerCase() === mapName.toLowerCase()
    )
    if (!mapStats || !mapStats.civilizations) {
        return {
            map: mapName,
            summary: `No civilization data available for ${mapName}`
             };
            }
  //find the best civs
  const bestCiv = mapStats.civilizations.reduce(
    (best: any, civ: any) => {
        if (!best || civ.win_rate > best.win_rate) {
            return civ;
        }
        return best;
    }, null);
    const civName = bestCiv?.civilization || "Unknown";
    const winRate = bestCiv?.win_rate ?? "N/A";

    return {
        map: mapName,
        recommendedCivilization: civName,
        winRate: `${winRate}%`,
        insight: `${formatCiv(civName)} performs strongly on ${mapName}`,
        summary: `Tip: ${formatCiv(civName)} is strong on ${mapName} (${winRate}% win rate)`
    }};
