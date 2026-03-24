import { db } from "../../db/index.js";
import { jobs } from "../../db/schema/jobs.js";
import { eq } from "drizzle-orm";
import { formatCiv } from "../../utils/format.js";

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
    const mapStats = statsData?.data?.find(
        (m: any) => m.map?.toLowerCase() === mapName.toLowerCase()
    )
    if (!mapStats || !mapStats.civilizations) {
        return {
            map: mapName,
            summary: `No civilization data available for ${mapName}`
             };
            }
  //find the best civs
  const civEntries = Object.entries(mapStats.civilizations);
  if(civEntries.length === 0){
    return {
        map: mapName,
        summary: `No civilization stats found for ${mapName}`
    }
  }
  let bestCivName = "";
  let bestWinRate = 0;

  for(const [civName, civData] of civEntries) {
    if( (civData as any).win_rate > bestWinRate) {
        bestWinRate = (civData as any).win_rate;
        bestCivName = civName;
    }
  }
  


    return {
        map: mapName,
        recommendedCivilization: bestCivName,
        winRate: `${bestWinRate.toFixed(4)}%`,
        insight: `${formatCiv(bestCivName)} performs strongly on ${mapName}`,
        summary: `Tip: ${formatCiv(bestCivName)} is strong on ${mapName} (${bestWinRate.toFixed(4)}% win rate)`
    }};
