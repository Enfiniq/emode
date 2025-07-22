"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useGame } from "@/contexts/GameContext";
import { useRouter } from "next/navigation";
import { canAccessDay, GAME_LAUNCH_DATE, isDayUnlockedByDate } from "@/lib/game-utils";
import {
  getDayStats,
  shareProgress,
  getTotalLevelsForDay,
} from "@/lib/unified-progress";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function DaySelector() {
  const { state } = useGame();
  const router = useRouter();

  const handleDaySelect = (dayNumber: number) => {
    if (canAccessDay(dayNumber, state.playerProgress.completedDays)) {
      router.push(`/day/${dayNumber}`);
    }
  };

  const handleShare = async (dayNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const dayStats = getDayStats(dayNumber);
      const canShare = dayStats.started || dayStats.completed;

      if (!canShare) {
        toast.error("This day hasn't been started yet!");
        return;
      }

      await shareProgress("day", dayNumber);
      toast.success("Shared successfully!");
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Share failed. Please try again.");
    }
  };

  if (state.isLoading) {
    return <LoadingSpinner alt="Loading Emolien transmissions..." />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col">
      <div className="flex-1 p-6">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {state.gameData.map((day) => {
            const isUnlocked = canAccessDay(
              day.day,
              state.playerProgress.completedDays
            );
            const isUnlockedByDate = isDayUnlockedByDate(day.day);
            const isUnlockedByProgress =
              state.playerProgress.completedDays.includes(day.day - 1);
            const dayStats = getDayStats(day.day);
            const totalLevels = getTotalLevelsForDay(day.day);
            const isCompleted = dayStats.completed;
            const dayProgress = dayStats.started
              ? {
                  levelAnswers: Array(dayStats.messagesDecoded.length).fill(""),
                  score: dayStats.score || 0,
                }
              : null;
            const progress = dayProgress
              ? (dayStats.messagesDecoded.length / totalLevels) * 100
              : 0;
            const canShare = dayStats.started || dayStats.completed;

            let unlockReason = "";
            if (day.day === 1) {
              unlockReason = "Available for everyone";
            } else if (isCompleted) {
              unlockReason = "Completed";
            } else if (isUnlockedByDate) {
              unlockReason = "Available for everyone";
            } else if (isUnlockedByProgress) {
              unlockReason = "Unlocked by progress";
            } else {
              const launchDate = new Date(GAME_LAUNCH_DATE);
              const unlockDate = new Date(launchDate);
              unlockDate.setDate(launchDate.getDate() + (day.day - 1));
              unlockReason = `Unlocks ${unlockDate.toLocaleDateString()}`;
            }

            return (
              <div
                key={day.day}
                className={`bg-card rounded-xl border border-border/30 p-8 cursor-pointer transition-all duration-200 hover:border-border/60 hover:shadow-lg min-h-[280px] flex flex-col ${
                  !isUnlocked ? "opacity-50 cursor-not-allowed" : ""
                } ${isCompleted ? "ring-2 ring-primary/50" : ""}`}
                onClick={() => handleDaySelect(day.day)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold">
                      Day {day.day}
                    </span>
                    {isCompleted && (
                      <Badge variant="secondary" className="text-sm">
                        ✓
                      </Badge>
                    )}
                    {dayStats.started && !isCompleted && (
                      <Badge variant="outline" className="text-sm">
                        In Progress
                      </Badge>
                    )}
                    {!isUnlocked && (
                      <Badge variant="outline" className="text-sm">
                        Locked
                      </Badge>
                    )}
                  </div>
                  {canShare && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-accent/20"
                      onClick={(e) => handleShare(day.day, e)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <h3 className="font-semibold mb-2 text-base">{day.title}</h3>

                <div className="mb-3">
                  <Badge
                    variant={isUnlocked ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {unlockReason}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                  {day.lore}
                </p>

                {dayProgress && (
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {dayStats.messagesDecoded.length}/{totalLevels}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <div className="flex justify-between items-center">
                      {dayProgress && dayProgress.score > 0 && (
                        <span className="text-xs font-medium">
                          {dayProgress.score}/{totalLevels * 100}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
