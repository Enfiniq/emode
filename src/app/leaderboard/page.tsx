"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Share2, Trophy, Target, Calendar, Clock } from "lucide-react";
import {
  getGameProgress,
  calculateGameStats,
  getStatsCards,
  shareProgress,
  getTotalLevelsForDay,
  getMaxPointsForDay,
} from "@/lib/unified-progress";
import {
  getFullDecodedMessage,
  getDecodedMessage,
  canAccessDay,
} from "@/lib/game-utils";
import gameData from "../../../game.json";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

interface ProgressState {
  completedDays: number[];
  dayStats: Record<number, DayStats>;
  totalDecodedMessage: string;
}

function StatsContent() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setMounted(true);
    const gameProgress = getGameProgress();
    setProgress(gameProgress);
  }, []);

  if (!mounted || !progress) {
    return <LoadingSpinner alt="Loading leaderboard..." />;
  }

  const stats = calculateGameStats();
  const statsCards = getStatsCards();
  const fullMessage = getFullDecodedMessage(progress.completedDays);

  const shareStats = async () => {
    await shareProgress("overall");
  };

  const iconMap: {
    [key: string]: React.ComponentType<{ className?: string }>;
  } = {
    Trophy,
    Calendar,
    Target,
    Clock,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => {
            const IconComponent = iconMap[card.icon];
            return (
              <div
                key={index}
                className="bg-card rounded-lg p-6 border border-border/30 text-center"
              >
                <IconComponent
                  className={`w-8 h-8 mx-auto mb-3 ${card.color}`}
                />
                <div className="text-2xl font-bold">
                  {card.value}
                  {card.max ? `/${card.max}` : ""}
                  {card.suffix || ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-lg p-6 border border-border/30 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Overall Progress</h2>
            <Badge variant="secondary">
              {Math.round(stats.overallProgress)}% Complete
            </Badge>
          </div>
          <Progress value={stats.overallProgress} className="h-3" />
          <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
            <span>
              Levels: {stats.totalLevels}/{stats.maxPossibleLevels}
            </span>
            <span>
              Score: {stats.totalScore}/{stats.maxPossibleScore}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats.completedDays === 7
              ? "Congratulations! You've decoded all Emolien messages!"
              : `${
                  7 - stats.completedDays
                } days remaining to complete your mission.`}
          </p>
        </div>

        {fullMessage && (
          <div className="bg-card rounded-lg p-6 border border-border/30 mb-8">
            <h2 className="text-xl font-semibold mb-4">Decoded Message</h2>
            <div className="bg-accent/5 rounded-lg p-6 border border-border/20">
              <p className="font-mono text-lg leading-relaxed text-center">
                &ldquo;{fullMessage}&rdquo;
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              The wisdom of the Emoliens revealed through your decoding efforts
            </p>
          </div>
        )}

        <div className="bg-card rounded-lg p-6 border border-border/30 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Day-by-Day Performance</h2>
            <Button onClick={shareStats}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Progress
            </Button>
          </div>
          <div className="grid gap-4">
            {gameData.map((day) => {
              const dayStats = progress.dayStats?.[day.day];
              const isCompleted = progress.completedDays.includes(day.day);
              const isUnlocked = canAccessDay(day.day, progress.completedDays);
              const score = dayStats?.score || 0;
              const levelsCompleted = dayStats?.messagesDecoded?.length || 0;
              const totalLevelsForDay = getTotalLevelsForDay(day.day);
              const maxScoreForDay = getMaxPointsForDay(day.day);
              const decodedMessage = getDecodedMessage(day.day);

              const partialScore = isCompleted
                ? score
                : (() => {
                    if (!dayStats?.started || levelsCompleted === 0) return 0;
                    const baseScorePerLevel = 100;
                    const tryPenalty = Math.max(
                      0,
                      (dayStats.tries - levelsCompleted) * 10
                    );
                    const hintPenalty = dayStats.hintsUsed * 25;
                    return Math.max(
                      levelsCompleted * 50,
                      levelsCompleted * baseScorePerLevel -
                        tryPenalty -
                        hintPenalty
                    );
                  })();

              return (
                <div
                  key={day.day}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    isCompleted
                      ? "bg-green-500/10 border-green-500/30"
                      : levelsCompleted > 0
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-muted/10 border-border/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : levelsCompleted > 0
                          ? "bg-yellow-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day.day}
                    </div>
                    <div>
                      <div className="font-semibold">{day.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {levelsCompleted}/{totalLevelsForDay} levels •{" "}
                        {partialScore}/{maxScoreForDay} points
                        {!isCompleted && levelsCompleted > 0 && (
                          <span className="text-yellow-600 ml-1">
                            (in progress)
                          </span>
                        )}
                      </div>
                      {isCompleted && decodedMessage && (
                        <div className="text-sm font-mono text-primary mt-1">
                          &ldquo;{decodedMessage}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted && <Badge variant="default">Complete</Badge>}
                    {levelsCompleted > 0 && !isCompleted && (
                      <Badge variant="secondary">In Progress</Badge>
                    )}
                    {levelsCompleted === 0 && !isUnlocked && (
                      <Badge variant="outline">Locked</Badge>
                    )}
                    {levelsCompleted === 0 && isUnlocked && (
                      <Badge variant="outline">Unlocked</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsPage() {
  return <StatsContent />;
}
