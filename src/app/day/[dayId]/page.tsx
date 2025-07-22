"use client";

import { useEffect, useState, useRef, use } from "react";
import { Button, Input, Space } from "antd";
import {
  BulbOutlined,
  ShareAltOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import gameData from "../../../../game.json";
import type { GameLevel } from "@/types/game";
import {
  getDayStats,
  updateDayProgress,
  updateTotalDecodedMessage,
  shareProgress,
  markDay,
  addDecodedMessage,
  incrementTries,
  isDayStarted,
  resetDay,
  getTotalLevelsForDay,
} from "@/lib/unified-progress";

interface ChatMessage {
  sender: "system" | "user";
  text: string;
  timestamp?: number;
  isTyping?: boolean;
}

function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-65px)]">
      <div className="max-w-7xl w-full h-full">
        <video autoPlay muted className="w-full h-full object-cover">
          <source src="/emolien.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

function LoreScreen({
  dayId,
  onAccept,
}: {
  dayId: string;
  onAccept: () => void;
}) {
  const [showButton, setShowButton] = useState(false);
  const dayData = gameData.find((day) => day.day === parseInt(dayId));
  const lore = dayData?.lore || "Welcome to your challenge!";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, lore.length * 50 + 500);
    return () => clearTimeout(timer);
  }, [lore]);

  return (
    <div className="flex flex-col justify-center items-center h-[80vh] p-8">
      <div className="rounded-2xl border border-border/30 p-8 max-w-2xl text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-6">
          Day {dayId}: {dayData?.title || "Challenge"}
        </h2>
        <div className="mb-8 text-lg">
          <TypingAnimation duration={50}>{lore}</TypingAnimation>
        </div>
        {showButton && (
          <Button
            type="primary"
            color="green"
            size="large"
            onClick={onAccept}
            className="px-8 py-2 h-auto animate-fade-in"
          >
            Let&apos;s Decode it!
          </Button>
        )}
      </div>
    </div>
  );
}

function ChatInterface({
  chat,
  input,
  setInput,
  onSend,
  onShowHint,
  progress,
  gameCompleted,
  onShare,
  onNextDay,
  onPlayAgain,
  totalLevels,
}: {
  chat: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onShowHint: () => void;
  progress: number;
  gameCompleted: boolean;
  onShare: () => void;
  onNextDay: () => void;
  onPlayAgain?: () => void;
  dayCompleted?: boolean;
  totalLevels: number;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottom = useRef(true);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 10;
      isScrolledToBottom.current = isAtBottom;
    }
  };

  useEffect(() => {
    const scrollToBottomSmooth = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
        isScrolledToBottom.current = true;
      }
    };

    const timeoutId = requestAnimationFrame(() => {
      scrollToBottomSmooth();

      setTimeout(() => scrollToBottomSmooth(), 100);
      setTimeout(() => scrollToBottomSmooth(), 300);
      setTimeout(() => scrollToBottomSmooth(), 600);
    });

    return () => cancelAnimationFrame(timeoutId);
  }, [chat]);
  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="mb-4 px-4 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {progress}/{totalLevels}
          </span>
        </div>
        <Progress value={(progress / totalLevels) * 100} className="h-2" />
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 space-y-4 pb-8"
      >
        {chat.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground ml-4"
                  : "bg-white text-gray-900 mr-4 shadow-sm"
              }`}
            >
              <div className="text-xs font-medium mb-1 opacity-75">
                {message.sender === "user" ? "You" : "Game Master"}
              </div>
              <div className="whitespace-pre-wrap">
                {message.isTyping ? (
                  <TypingAnimation duration={20}>
                    {message.text}
                  </TypingAnimation>
                ) : (
                  message.text
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-8" />
      </div>

      {gameCompleted ? (
        <div className="px-4 py-4 space-y-3 border-t bg-background">
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              type="default"
              color="green"
              onClick={onPlayAgain}
              className="w-full"
              size="large"
            >
              Play This Day Again
            </Button>
            <Button
              type="primary"
              icon={<ShareAltOutlined />}
              onClick={onShare}
              className="w-full"
              size="large"
            >
              Share Progress
            </Button>
          </div>
          <Button
            type="default"
            color="green"
            icon={<ArrowRightOutlined />}
            onClick={onNextDay}
            className="w-full"
            size="large"
          >
            Continue to Next Day
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 border-t bg-background">
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={onSend}
              placeholder="Type your answer..."
              className="rounded-l-full"
              size="large"
            />
            <Button
              icon={<BulbOutlined />}
              onClick={onShowHint}
              className="px-3"
              size="large"
              title="Show hint"
            />
            <Button
              type="primary"
              onClick={onSend}
              className="rounded-r-full px-6"
              size="large"
            >
              Send
            </Button>
          </Space.Compact>
        </div>
      )}
    </div>
  );
}

export default function DayPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const resolvedParams = use(params);
  const dayId = resolvedParams.dayId;

  const [loading, setLoading] = useState(true);
  const [showLore, setShowLore] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [dayWasCompleted, setDayWasCompleted] = useState(false);
  const router = useRouter();

  const dayData = gameData.find((day) => day.day === parseInt(dayId));
  const totalLevels = getTotalLevelsForDay(parseInt(dayId));

  const handleNextDay = () => {
    const nextDay = parseInt(dayId) + 1;
    if (nextDay <= 7) {
      router.push(`/day/${nextDay}`);
    } else {
      router.push("/leaderboard");
    }
  };

  const handlePlayAgain = () => {
    const dayNumber = parseInt(dayId);
    resetDay(dayNumber);
    setLoading(true);
    setShowLore(false);
    setAccepted(false);
    setChat([]);
    setInput("");
    setCurrentLevel(1);
    setHintsUsed(0);
    setGameCompleted(false);
    setDayWasCompleted(false);

    setTimeout(() => {
      setLoading(false);
      setShowLore(true);
    }, 2500);

    toast.success("Day reset! Starting fresh...");
  };

  useEffect(() => {
    const dayNumber = parseInt(dayId);

    const stats = getDayStats(dayNumber);
    const alreadyStarted = isDayStarted(dayNumber);

    console.log(
      "Day:",
      dayNumber,
      "Already started:",
      alreadyStarted,
      "Stats:",
      stats
    );

    console.log("Always showing video and lore for day", dayNumber);

    if (alreadyStarted) {
      const calculatedLevel =
        stats.messagesDecoded.length + 1 <= totalLevels
          ? stats.messagesDecoded.length + 1
          : totalLevels;

      setCurrentLevel(calculatedLevel);
      setHintsUsed(stats.hintsUsed);
      setGameCompleted(stats.completed);
      setDayWasCompleted(stats.completed);
    }

    const timer = setTimeout(() => {
      console.log("Video timer completed, showing lore");
      setLoading(false);
      setShowLore(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [dayId, dayData?.instruction, dayData?.levels, totalLevels]);

  const addMessage = (message: ChatMessage, delay = 0) => {
    setTimeout(() => {
      setChat((prev) => [...prev, { ...message, isTyping: true }]);
    }, delay + 500);
  };

  const handleAccept = () => {
    const dayNumber = parseInt(dayId);
    const stats = getDayStats(dayNumber);
    const alreadyStarted = isDayStarted(dayNumber);
    if (!alreadyStarted) {
      markDay(dayNumber);
    }

    setAccepted(true);

    if (stats.completed) {
      addMessage(
        { sender: "system", text: `Welcome back to Day ${dayId}! 🎉` },
        0
      );
      addMessage(
        {
          sender: "system",
          text: `Congratulations on successfully decoding all the ciphers in Day ${dayId}! You've completed this challenge.`,
        },
        1500
      );
      addMessage(
        {
          sender: "system",
          text: `Your Stats:\n Tries: ${stats.tries}\n Hints Used: ${stats.hintsUsed}\n Messages Decoded: ${totalLevels}/${totalLevels}`,
        },
        3000
      );
      addMessage(
        {
          sender: "system",
          text: "Would you like to play this day again and try to improve your score?",
          isTyping: false,
        },
        4500
      );
      setGameCompleted(true);
      return;
    }

    if (alreadyStarted) {
      addMessage(
        { sender: "system", text: `Welcome back to Day ${dayId}!` },
        0
      );
      addMessage(
        {
          sender: "system",
          text: dayData?.instruction || "Continue solving the cipher below.",
        },
        1500
      );

      const nextLevelIndex = stats.messagesDecoded.length + 1;
      if (
        !stats.completed &&
        dayData?.levels &&
        nextLevelIndex <= totalLevels
      ) {
        const currentCipher = (dayData.levels as Record<string, GameLevel[]>)[
          nextLevelIndex.toString()
        ]?.[0];
        if (currentCipher) {
          addMessage(
            {
              sender: "system",
              text: `Level ${nextLevelIndex} Instructions: ${currentCipher.instruction}`,
            },
            3000
          );
          addMessage(
            { sender: "system", text: `Cipher: ${currentCipher.cipher}` },
            4500
          );
        }
      }
    } else {
      addMessage({ sender: "system", text: `Welcome to Day ${dayId}!` }, 0);
      addMessage(
        {
          sender: "system",
          text: dayData?.instruction || "Solve the cipher below.",
        },
        1500
      );

      if (dayData?.levels["1"]?.[0]) {
        const firstCipher = (dayData.levels as Record<string, GameLevel[]>)[
          "1"
        ][0];
        addMessage(
          {
            sender: "system",
            text: `Level 1 Instructions: ${firstCipher.instruction}`,
          },
          3000
        );
        addMessage(
          { sender: "system", text: `Cipher: ${firstCipher.cipher}` },
          4500
        );
      }
    }

    toast.success("Challenge accepted!");
  };

  const handleShowHint = () => {
    if (!dayData) return;
    const dayNumber = parseInt(dayId);
    const currentLevelData = (dayData.levels as Record<string, GameLevel[]>)?.[
      currentLevel.toString()
    ]?.[0];
    if (currentLevelData) {
      setHintsUsed((prev) => prev + 1);

      updateDayProgress(dayNumber, {
        hintsUsed: hintsUsed + 1,
      });

      addMessage(
        { sender: "system", text: `Hint: ${currentLevelData.clue}` },
        0
      );
      toast.info("Hint revealed!");
    }
  };

  const showCompletionStats = () => {
    const dayNumber = parseInt(dayId);
    const stats = getDayStats(dayNumber);
    const totalDecodedMessage = updateTotalDecodedMessage();

    addMessage({ sender: "system", text: `🎉 Day ${dayId} Complete!` }, 2000);
    addMessage(
      {
        sender: "system",
        text: `Your Stats:\n Tries: ${stats.tries}\n Hints Used: ${stats.hintsUsed}`,
      },
      3500
    );
    addMessage(
      {
        sender: "system",
        text: `Messages Decoded So Far:\n"${totalDecodedMessage}"`,
      },
      5000
    );

    addMessage(
      {
        sender: "system",
        text: `Share your progress with friends!`,
        isTyping: false,
      },
      6500
    );

    const nextDay = parseInt(dayId) + 1;
    if (nextDay <= 7) {
      addMessage(
        {
          sender: "system",
          text: `Ready for Day ${nextDay}? Continue your journey! ->`,
          isTyping: false,
        },
        8000
      );
    }
  };

  const handleShare = async () => {
    try {
      await shareProgress("day", parseInt(dayId));
      toast.success("Progress shared successfully!");
    } catch {
      toast.error("Failed to share progress. Please try again.");
    }
  };

  const handleSend = () => {
    if (!input.trim() || !dayData) return;

    const dayNumber = parseInt(dayId);
    const newMessage: ChatMessage = { sender: "user", text: input.trim() };
    setChat((prev) => [...prev, newMessage]);

    incrementTries(dayNumber);

    const currentLevelData = (dayData.levels as Record<string, GameLevel[]>)[
      currentLevel.toString()
    ]?.[0];

    if (
      currentLevelData &&
      input.trim().toLowerCase() === currentLevelData.answer.toLowerCase()
    ) {
      addDecodedMessage(dayNumber, currentLevelData.answer);

      addMessage({ sender: "system", text: "Correct! Well done." }, 1000);

      if (currentLevel < totalLevels) {
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);

        const nextLevelData = (dayData.levels as Record<string, GameLevel[]>)[
          nextLevel.toString()
        ]?.[0];
        if (nextLevelData) {
          addMessage(
            {
              sender: "system",
              text: `Level ${nextLevel} Instructions: ${nextLevelData.instruction}`,
            },
            2500
          );
          addMessage(
            { sender: "system", text: `Cipher: ${nextLevelData.cipher}` },
            4000
          );
        }

        toast.success(`🎉 Level ${currentLevel} completed!`);
      } else {
        const stats = getDayStats(dayNumber);
        updateDayProgress(dayNumber, {
          completed: true,
          tries: stats.tries,
          hintsUsed,
          completedAt: new Date(),
        });

        setGameCompleted(true);
        showCompletionStats();
        toast.success("🎉 Day completed! You solved all ciphers!");
      }
    } else {
      addMessage(
        {
          sender: "system",
          text: "Try again! Use the hint button if you need help.",
        },
        1000
      );
      toast.error("Incorrect answer.");
    }

    setInput("");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (showLore && !accepted) {
    return <LoreScreen dayId={dayId} onAccept={handleAccept} />;
  }

  return (
    <ChatInterface
      chat={chat}
      input={input}
      setInput={setInput}
      onSend={handleSend}
      onShowHint={handleShowHint}
      progress={dayWasCompleted ? totalLevels : currentLevel - 1}
      gameCompleted={gameCompleted}
      onShare={handleShare}
      onNextDay={handleNextDay}
      onPlayAgain={handlePlayAgain}
      dayCompleted={dayWasCompleted}
      totalLevels={totalLevels}
    />
  );
}
