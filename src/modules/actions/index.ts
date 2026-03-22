import { aoe4MatchSummaryAction } from "./aoe4.action.ts";
import { aoe4ProfileAction } from "./aoe4_player_profile.ts";
import { aoe4MetaAction } from "./aoe4-meta.action.ts";

export const actions = {
  aoe4_match_summary: aoe4MatchSummaryAction,
  aoe4_player_profile:aoe4ProfileAction,
  aoe4_meta: aoe4MetaAction
};