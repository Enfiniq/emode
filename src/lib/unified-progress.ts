import gameData from "../../game.json";

interface DayStats {
  day: number;
  started: boolean;
  completed: boolean;
  tries: number;
  hintsUsed: number;
  messagesDecoded: string[];
  completedAt?: Date;
  startedAt?: Date;
  score?: number;
}

interface GameProgress {
  completedDays: number[];
  dayStats: Record<number, DayStats>;
  totalDecodedMessage: string;
}

interface StatsCard {
  icon: string;
  value: number;
  max?: number | null;
  label: string;
  suffix?: string;
  color: string;
}

interface GameStats {
  completedDays: number;
  totalScore: number;
  totalTries: number;
  totalHints: number;
  totalLevels: number;
  maxPossibleLevels: number;
  maxPossibleScore: number;
  overallProgress: number;
  totalDecodedMessage: string;
}

interface GameConfiguration {
  totalDays: number;
  totalLevels: number;
  totalPossiblePoints: number;
  pointsPerLevel: number;
  levelsByDay: Record<number, number>;
  maxPointsByDay: Record<number, number>;
}

const STORAGE_KEY = "emode-progress";
const POINTS_PER_LEVEL = 100;

const DAY_MESSAGES: Record<number, string> = {
  1: "Emode:",
  2: " we always strive for what",
  3: " we cannot have and in",
  4: " doing so neglect the treasures",
  5: " already in our grasp.",
  6: " So Save Earth Save You.",
  7: " As Maybe We're Just a Dream.",
};

export function getGameConfiguration(): GameConfiguration {
  const levelsByDay: Record<number, number> = {};
  const maxPointsByDay: Record<number, number> = {};
  let totalLevels = 0;
  gameData.forEach((day) => {
    const levelCount = Object.keys(day.levels).length;
    levelsByDay[day.day] = levelCount;
    maxPointsByDay[day.day] = levelCount * POINTS_PER_LEVEL;
    totalLevels += levelCount;
  });
  return {
    totalDays: gameData.length,
    totalLevels,
    totalPossiblePoints: totalLevels * POINTS_PER_LEVEL,
    pointsPerLevel: POINTS_PER_LEVEL,
    levelsByDay,
    maxPointsByDay,
  };
}

export function getTotalLevelsForDay(dayNumber: number): number {
  const config = getGameConfiguration();
  return config.levelsByDay[dayNumber] || 0;
}

export function getMaxPointsForDay(dayNumber: number): number {
  const config = getGameConfiguration();
  return config.maxPointsByDay[dayNumber] || 0;
}

export function getDayMessage(dayNumber: number): string {
  return DAY_MESSAGES[dayNumber] || "";
}

function buildTotalDecodedMessage(completedDays: number[]): string {
  return completedDays
    .sort((a, b) => a - b)
    .map(getDayMessage)
    .filter(Boolean)
    .join("");
}

export function getGameProgress(): GameProgress {
  if (typeof window === "undefined") {
    return { completedDays: [], dayStats: {}, totalDecodedMessage: "" };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { completedDays: [], dayStats: {}, totalDecodedMessage: "" };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading progress:", error);
    return { completedDays: [], dayStats: {}, totalDecodedMessage: "" };
  }
}

export function saveGameProgress(progress: GameProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}

export function getDayStats(dayNumber: number): DayStats {
  const progress = getGameProgress();
  return (
    progress.dayStats?.[dayNumber] || {
      day: dayNumber,
      started: false,
      completed: false,
      tries: 0,
      hintsUsed: 0,
      messagesDecoded: [],
    }
  );
}

export function calculateGameStats(): GameStats {
  const progress = getGameProgress();
  const config = getGameConfiguration();
  const completedDays = progress.completedDays.length;
  let totalScore = 0;
  let totalTries = 0;
  let totalHints = 0;
  let totalLevels = 0;
  for (let day = 1; day <= config.totalDays; day++) {
    const stats = getDayStats(day);
    if (stats.completed) {
      const calculatedScore = calculateDayScore(day);
      totalScore += calculatedScore;
      totalLevels += config.levelsByDay[day];
    } else if (stats.started) {
      const messagesDecoded = stats.messagesDecoded.length;
      totalLevels += messagesDecoded;
      const tryPenalty = Math.max(0, (stats.tries - messagesDecoded) * 10);
      const hintPenalty = stats.hintsUsed * 25;
      const partialScore = Math.max(
        messagesDecoded * 50,
        messagesDecoded * config.pointsPerLevel - tryPenalty - hintPenalty
      );
      totalScore += partialScore;
    }
    if (stats.started) {
      totalTries += stats.tries;
      totalHints += stats.hintsUsed;
    }
  }
  const overallProgress = (completedDays / config.totalDays) * 100;
  return {
    completedDays,
    totalScore,
    totalTries,
    totalHints,
    totalLevels,
    maxPossibleLevels: config.totalLevels,
    maxPossibleScore: config.totalPossiblePoints,
    overallProgress,
    totalDecodedMessage: buildTotalDecodedMessage(progress.completedDays),
  };
}

export function getStatsCards(): StatsCard[] {
  const stats = calculateGameStats();
  const config = getGameConfiguration();
  return [
    {
      icon: "Trophy",
      value: stats.totalScore,
      max: stats.maxPossibleScore,
      label: "Total Points",
      color: "text-yellow-500",
    },
    {
      icon: "Calendar",
      value: stats.completedDays,
      max: config.totalDays,
      label: "Days Complete",
      color: "text-green-500",
    },
    {
      icon: "Target",
      value: stats.totalLevels,
      max: stats.maxPossibleLevels,
      label: "Levels Solved",
      color: "text-blue-500",
    },
    {
      icon: "Clock",
      value: Math.round(stats.overallProgress),
      max: null,
      label: "Overall Progress",
      suffix: "%",
      color: "text-purple-500",
    },
  ];
}

export function createShareMessage(
  type: "day" | "overall",
  dayNumber?: number
): string {
  if (type === "day" && dayNumber) {
    const dayStats = getDayStats(dayNumber);
    const totalLevelsForDay = getTotalLevelsForDay(dayNumber);
    const decodedCount = dayStats.completed
      ? totalLevelsForDay
      : dayStats.messagesDecoded.length;
    return `EMODE Day ${dayNumber}!
Tries: ${dayStats.tries}
Hints Used: ${dayStats.hintsUsed}
Messages Decoded: ${decodedCount}/${totalLevelsForDay}
${dayStats.completed ? "Completed!" : "In Progress..."}

Can you solve the emode? Play at: https://emode.neploom.com

#EMODE #Emoliens #EmodeCipher`;
  }
  const stats = calculateGameStats();
  return `EMODE Progress!
Days Completed: ${stats.completedDays}/7
Tries: ${stats.totalTries}
Hints Used: ${stats.totalHints}
Total Score: ${stats.totalScore}/${stats.maxPossibleScore}
Message Decode: ${stats.totalLevels}/${stats.maxPossibleLevels}

Can you solve the emode? Play at: https://emode.neploom.com

#EMODE #Emoliens #EmodeCipher`;
}

export async function shareProgress(
  type: "day" | "overall",
  dayNumber?: number
): Promise<void> {
  const shareText = createShareMessage(type, dayNumber);
  const title = type === "day" ? `EMODE Day ${dayNumber}` : "My EMODE Progress";
  try {
    if (navigator.share && typeof navigator.share === "function") {
      await navigator.share({ title, text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Share failed:", err);
    }
    document.body.removeChild(textArea);
  }
}

export function updateDayProgress(
  dayNumber: number,
  stats: Partial<DayStats>
): GameProgress {
  const progress = getGameProgress();
  if (!progress.dayStats) {
    progress.dayStats = {};
  }
  if (!progress.dayStats[dayNumber]) {
    progress.dayStats[dayNumber] = {
      day: dayNumber,
      started: false,
      completed: false,
      tries: 0,
      hintsUsed: 0,
      messagesDecoded: [],
    };
  }
  progress.dayStats[dayNumber] = {
    ...progress.dayStats[dayNumber],
    ...stats,
  };
  if (stats.completed && !progress.completedDays.includes(dayNumber)) {
    progress.completedDays.push(dayNumber);
    progress.completedDays.sort((a, b) => a - b);
  }
  progress.totalDecodedMessage = buildTotalDecodedMessage(
    progress.completedDays
  );
  saveGameProgress(progress);
  return progress;
}

export function markDayStarted(dayNumber: number): GameProgress {
  const progress = getGameProgress();
  if (!progress.dayStats?.[dayNumber]) {
    return updateDayProgress(dayNumber, {
      started: true,
      startedAt: new Date(),
    });
  }
  if (!progress.dayStats[dayNumber].started) {
    return updateDayProgress(dayNumber, {
      started: true,
      startedAt: new Date(),
    });
  }
  return progress;
}

export function markDay(dayNumber: number): GameProgress {
  return markDayStarted(dayNumber);
}

export function addDecodedMessage(dayNumber: number, message: string): void {
  const progress = getGameProgress();
  if (!progress.dayStats[dayNumber]) {
    markDayStarted(dayNumber);
  }
  const currentMessages = progress.dayStats[dayNumber]?.messagesDecoded || [];
  if (!currentMessages.includes(message)) {
    currentMessages.push(message);
    updateDayProgress(dayNumber, { messagesDecoded: currentMessages });
  }
}

export function incrementTries(dayNumber: number): void {
  const currentTries = getDayStats(dayNumber).tries;
  updateDayProgress(dayNumber, { tries: currentTries + 1 });
}

export function isDayStarted(dayNumber: number): boolean {
  const stats = getDayStats(dayNumber);
  return stats.started || stats.completed;
}

export function resetDay(dayNumber: number): void {
  const progress = getGameProgress();
  progress.completedDays = progress.completedDays.filter(
    (day) => day !== dayNumber
  );
  delete progress.dayStats[dayNumber];
  progress.totalDecodedMessage = buildTotalDecodedMessage(
    progress.completedDays
  );
  saveGameProgress(progress);
}

export function updateTotalDecodedMessage(): string {
  const progress = getGameProgress();
  progress.totalDecodedMessage = buildTotalDecodedMessage(
    progress.completedDays
  );
  saveGameProgress(progress);
  return progress.totalDecodedMessage;
}

export function calculateDayScore(dayNumber: number): number {
  const stats = getDayStats(dayNumber);
  if (!stats.completed) return 0;
  const config = getGameConfiguration();
  const totalLevels = config.levelsByDay[dayNumber];
  const baseScore = totalLevels * config.pointsPerLevel;
  const tryPenalty = Math.max(0, (stats.tries - totalLevels) * 10);
  const hintPenalty = stats.hintsUsed * 25;
  const minScore = totalLevels * 50;
  return Math.max(minScore, baseScore - tryPenalty - hintPenalty);
}
