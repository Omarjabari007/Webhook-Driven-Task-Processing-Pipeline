export type Player = {
  name: string;
  result: "win" | "loss";
  civilization: string;
};

export type MatchSummaryResult = {
  matchId: number;
  map: string;
  duration: string;
  players: Player[];
  summary: string;
};

export type JobResult = {
  summary?: string;
  [key: string]: any;
}