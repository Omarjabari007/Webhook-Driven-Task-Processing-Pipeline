import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { eq } from "drizzle-orm";

const MAX_JOB_RETRIES = 5;

export async function aoe4ProfileAction(payload: any, job: any){
    const profileId = payload?.profileId;
    if(!profileId){
        throw new Error("Missing profileId")
    }
    let apiData: any;
    try{
        const response = await fetch(`https://aoe4world.com/api/v0/players/${profileId}`)
        if(!response.ok){
            throw new Error("Player not ready")
        }
        apiData = await response.json();
    }
    catch{
        const newAttempts = job.attempts + 1;
        if(newAttempts >= MAX_JOB_RETRIES){
            await db.update(jobs).set({ status: "failed", attempts: newAttempts })
            .where(eq(jobs.id ,job.id))
        }else{
            await db.update(jobs).set({ status: "failed", attempts: newAttempts })
            .where(eq(jobs.id,job.id))
        }
        return null;
    }
    const player = apiData?.player;
    const result = {
        player: player?.name,
        country: player?.country,
        rating: player?.rating,
        mmr: player?.mmr,
        gamesPlayed: player?.games_count,
        winRate: player?.win_rate,
        summary: `${player?.name} (${player?.country}) has rating ${player?.rating} and MMR ${player?.mmr}`
  };
  return result;
}