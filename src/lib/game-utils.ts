import { GameDay, GameLevel } from "@/types/game";
import gameData from "../../game.json";

export const loadGameData = (): GameDay[] => {
  return gameData as GameDay[];
};

export const getCurrentLevel = (
  day: GameDay,
  levelNumber: number
): GameLevel | null => {
  const levelKey = levelNumber.toString();
  return day.levels[levelKey]?.[0] || null;
};

export const getTotalLevelsForDay = (day: GameDay): number => {
  return Object.keys(day.levels).length;
};

export const isAnswerCorrect = (
  userAnswer: string,
  correctAnswer: string
): boolean => {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
};

export const canAccessDay = (
  dayNumber: number,
  completedDays: number[]
): boolean => {
  if (dayNumber === 1) return true;

  if (completedDays.includes(dayNumber)) return true;

  if (completedDays.includes(dayNumber - 1)) return true;

  if (isDayUnlockedByDate(dayNumber)) return true;

  return false;
};

export const GAME_LAUNCH_DATE = new Date("2025-07-21");

export const isDayUnlockedByDate = (dayNumber: number): boolean => {
  const now = new Date();
  const launchDate = new Date(GAME_LAUNCH_DATE);

  const timeDiff = now.getTime() - launchDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  return dayNumber <= daysDiff + 1 && dayNumber >= 1;
};

export const getDaysUnlockedByDate = (): number => {
  const now = new Date();
  const launchDate = new Date(GAME_LAUNCH_DATE);

  const timeDiff = now.getTime() - launchDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  return Math.min(Math.max(daysDiff + 1, 1), 7);
};

export const getNextDateUnlock = (): Date | null => {
  const daysUnlocked = getDaysUnlockedByDate();

  if (daysUnlocked >= 7) return null;

  const launchDate = new Date(GAME_LAUNCH_DATE);
  const nextUnlockDate = new Date(launchDate);
  nextUnlockDate.setDate(launchDate.getDate() + daysUnlocked);

  return nextUnlockDate;
};

export const getDecodedMessage = (dayNumber: number): string => {
  const messages = [
    "",
    "Emode:",
    " we always strive for what",
    " we cannot have and in",
    " doing so neglect the treasures",
    " already in our grasp.",
    " So Save Earth Save You.",
    " As Maybe We're Just a Dream.",
  ];
  return messages[dayNumber] || "";
};

export const getFullDecodedMessage = (completedDays: number[]): string => {
  const completedMessages = completedDays
    .sort((a, b) => a - b)
    .map((day) => getDecodedMessage(day))
    .filter((msg) => msg.length > 0);
  return completedMessages.join("");
};
