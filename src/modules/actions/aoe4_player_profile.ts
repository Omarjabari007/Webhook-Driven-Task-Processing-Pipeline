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
    const mode = apiData?.modes?.rm_solo;
    if (!mode) {
        throw new Error("Player has no rm_solo data");
    }
    const wins = mode.wins_count ?? 0;
    const losses = mode.losses_count ?? 0;
    const totalGames = mode.games_count ?? (wins + losses);

    const winRate = mode.win_rate? `${mode.win_rate}%` :totalGames >0 
    ? `${Math.round( (wins/totalGames) *100 )}%` :"N/A";

    const result = {
        player: apiData?.name,
        country: apiData?.country,
        rating: mode.rating,
        rank: mode.mmr,
        rank_level: mode.rank_level,
        gamesPlayed: totalGames,wins,losses,winRate,
        summary: `${apiData?.name} - ${apiData?.country} is rank: ${mode.rank_level} and rating is: ${mode.rating} with winrate = ${winRate}`
  };
  
  return result;
}