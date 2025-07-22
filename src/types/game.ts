export interface GameLevel {
  type: string;
  cipher: string;
  instruction: string;
  clue: string;
  answer: string;
}

export interface GameDay {
  day: number;
  title: string;
  lore: string;
  instruction: string;
  levels: Record<string, GameLevel[]>;
}

export interface PlayerProgress {
  currentDay: number;
  completedDays: number[];
  dayProgress: Record<
    number,
    {
      currentLevel: number;
      levelAnswers: string[];
      completed: boolean;
      score: number;
      completedAt?: string;
    }
  >;
  lastPlayedDate: string;
}

export interface GameState {
  gameData: GameDay[];
  playerProgress: PlayerProgress;
  currentDay: number;
  currentLevel: number;
  currentAnswer: string;
  showHint: boolean;
  gameCompleted: boolean;
  isLoading: boolean;
}
