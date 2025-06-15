import type { Player } from "./Player";

export type GameData = {
  players: Player[];
  roles: { [playerName: string]: "civilian" | "undercover" };
  words: {
    civilian: string;
    undercover: string;
  };
  clues: { [playerName: string]: string };
  round: number;
  usedWordPairs: string[];
};
