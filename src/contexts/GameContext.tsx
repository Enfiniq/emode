"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { GameState, PlayerProgress, GameDay } from "@/types/game";
import {
  loadGameData,
  getCurrentLevel,
  isAnswerCorrect,
} from "@/lib/game-utils";
import { shareProgress, getTotalLevelsForDay } from "@/lib/unified-progress";

interface GameContextType {
  state: GameState;
  startDay: (day: number) => void;
  submitAnswer: (answer: string) => boolean;
  nextLevel: () => void;
  toggleHint: () => void;
  resetGame: () => void;
  shareResults: (day: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | {
      type: "LOAD_GAME";
      payload: { gameData: GameDay[]; playerProgress: PlayerProgress };
    }
  | { type: "START_DAY"; payload: number }
  | { type: "SUBMIT_ANSWER"; payload: string }
  | { type: "NEXT_LEVEL" }
  | { type: "TOGGLE_HINT" }
  | { type: "RESET_GAME" }
  | { type: "SET_LOADING"; payload: boolean };

const initialPlayerProgress: PlayerProgress = {
  currentDay: 1,
  completedDays: [],
  dayProgress: {},
  lastPlayedDate: new Date().toISOString().split("T")[0],
};

const initialState: GameState = {
  gameData: [],
  playerProgress: initialPlayerProgress,
  currentDay: 1,
  currentLevel: 1,
  currentAnswer: "",
  showHint: false,
  gameCompleted: false,
  isLoading: true,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOAD_GAME":
      return {
        ...state,
        gameData: action.payload.gameData,
        playerProgress: action.payload.playerProgress,
        isLoading: false,
      };

    case "START_DAY":
      return {
        ...state,
        currentDay: action.payload,
        currentLevel: 1,
        currentAnswer: "",
        showHint: false,
      };

    case "SUBMIT_ANSWER":
      return {
        ...state,
        currentAnswer: action.payload,
      };

    case "NEXT_LEVEL":
      const currentDayData = state.gameData[state.currentDay - 1];
      const totalLevels = getTotalLevelsForDay(currentDayData.day);

      if (state.currentLevel < totalLevels) {
        return {
          ...state,
          currentLevel: state.currentLevel + 1,
          currentAnswer: "",
          showHint: false,
        };
      } else {
        const updatedCompletedDays = [...state.playerProgress.completedDays];
        if (!updatedCompletedDays.includes(state.currentDay)) {
          updatedCompletedDays.push(state.currentDay);
        }

        return {
          ...state,
          playerProgress: {
            ...state.playerProgress,
            completedDays: updatedCompletedDays,
            dayProgress: {
              ...state.playerProgress.dayProgress,
              [state.currentDay]: {
                ...state.playerProgress.dayProgress[state.currentDay],
                completed: true,
                completedAt: new Date().toISOString(),
              },
            },
          },
          currentLevel: 1,
          currentAnswer: "",
          showHint: false,
        };
      }

    case "TOGGLE_HINT":
      return {
        ...state,
        showHint: !state.showHint,
      };

    case "RESET_GAME":
      return {
        ...state,
        playerProgress: initialPlayerProgress,
        currentDay: 1,
        currentLevel: 1,
        currentAnswer: "",
        showHint: false,
        gameCompleted: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const loadGame = () => {
      const gameData = loadGameData();
      const savedProgress = localStorage.getItem("emode-progress");
      const playerProgress = savedProgress
        ? JSON.parse(savedProgress)
        : initialPlayerProgress;

      dispatch({
        type: "LOAD_GAME",
        payload: { gameData, playerProgress },
      });
    };

    loadGame();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(
        "emode-progress",
        JSON.stringify(state.playerProgress)
      );
    }
  }, [state.playerProgress, state.isLoading]);

  const startDay = (day: number) => {
    dispatch({ type: "START_DAY", payload: day });
  };

  const submitAnswer = (answer: string): boolean => {
    const currentDayData = state.gameData[state.currentDay - 1];
    const currentLevelData = getCurrentLevel(
      currentDayData,
      state.currentLevel
    );

    if (!currentLevelData) return false;

    dispatch({ type: "SUBMIT_ANSWER", payload: answer });

    const isCorrect = isAnswerCorrect(answer, currentLevelData.answer);

    if (isCorrect) {
      const updatedAnswers = [
        ...(state.playerProgress.dayProgress[state.currentDay]?.levelAnswers ||
          []),
      ];
      updatedAnswers[state.currentLevel - 1] = answer;

      const newDayProgress = {
        ...state.playerProgress.dayProgress[state.currentDay],
        currentLevel: state.currentLevel,
        levelAnswers: updatedAnswers,
        completed: false,
        score: updatedAnswers.length * 100,
      };

      const updatedPlayerProgress = {
        ...state.playerProgress,
        dayProgress: {
          ...state.playerProgress.dayProgress,
          [state.currentDay]: newDayProgress,
        },
      };

      dispatch({
        type: "LOAD_GAME",
        payload: {
          gameData: state.gameData,
          playerProgress: updatedPlayerProgress,
        },
      });

      setTimeout(() => dispatch({ type: "NEXT_LEVEL" }), 1000);
    }

    return isCorrect;
  };

  const nextLevel = () => {
    dispatch({ type: "NEXT_LEVEL" });
  };

  const toggleHint = () => {
    dispatch({ type: "TOGGLE_HINT" });
  };

  const resetGame = () => {
    localStorage.removeItem("emode-progress");
    dispatch({ type: "RESET_GAME" });
  };

  const shareResults = async (day: number) => {
    try {
      await shareProgress("day", day);
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const contextValue: GameContextType = {
    state,
    startDay,
    submitAnswer,
    nextLevel,
    toggleHint,
    resetGame,
    shareResults,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
