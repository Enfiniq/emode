import { Metadata } from "next";
import { getGameConfiguration } from "@/lib/unified-progress";

export const metadata: Metadata = {
  title: "About - EMODE",
  description: "Learn about EMODE, the alien cipher game from planet Emode.",
};

export default function AboutPage() {
  
  const config = getGameConfiguration();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card rounded-lg p-6 border border-border/30">
            <h2 className="text-2xl font-semibold mb-4">The Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Emoliens from the distant planet Emode have been sending
              encrypted messages to Earth. These ancient beings possess advanced
              knowledge and are trying to share their wisdom with humanity.
              However, their messages are encoded using various cipher
              techniques that must be decoded.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              As you progress through the {config.totalDays} days of challenges,
              you&apos;ll uncover a profound message about life, desires, and
              the treasures we already possess.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border/30">
            <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold mt-0.5">
                  1
                </span>
                <span>
                  Each day contains multiple cipher challenges (5-6 levels)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold mt-0.5">
                  2
                </span>
                <span>Read the cipher message and instructions carefully</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold mt-0.5">
                  3
                </span>
                <span>
                  Use the hint if you&apos;re stuck (click the lightbulb)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold mt-0.5">
                  4
                </span>
                <span>Complete all levels to unlock the next day</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold mt-0.5">
                  5
                </span>
                <span>Share your progress with friends!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border/30 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Cipher Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-accent/5 rounded-lg p-4 border border-border/20">
              <h3 className="font-semibold mb-2">Day 1: Math & Sequence</h3>
              <p className="text-sm text-muted-foreground">
                {config.levelsByDay[1]} levels • Solve equations and number
                patterns
              </p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 border border-border/20">
              <h3 className="font-semibold mb-2">Day 2: Emoji Cipher</h3>
              <p className="text-sm text-muted-foreground">
                {config.levelsByDay[2]} levels • Decode messages hidden in
                emojis
              </p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 border border-border/20">
              <h3 className="font-semibold mb-2">Day 3: Caesar Shift</h3>
              <p className="text-sm text-muted-foreground">
                {config.levelsByDay[3]} levels • Classic letter shifting ciphers
              </p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 border border-border/20">
              <h3 className="font-semibold mb-2">Day 4: Symbol Cipher</h3>
              <p className="text-sm text-muted-foreground">
                {config.levelsByDay[4]} levels • Mix of symbols, numbers, and
                letters
              </p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 border border-border/20">
              <h3 className="font-semibold mb-2">Day 5: Number Systems</h3>
              <p className="text-sm text-muted-foreground">
                {config.levelsByDay[5]} levels • Binary, hex, and other bases
              </p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 border border-border/20">
              <h3 className="font-semibold mb-2">Day 6: Coordinate Cipher</h3>
              <p className="text-sm text-muted-foreground">
                {config.levelsByDay[6]} levels • Grid-based position decoding
              </p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 border border-border/20">
              <h3 className="font-semibold mb-2">Day 7: Mixed Challenges</h3>
              <p className="text-sm text-muted-foreground">
                {config.levelsByDay[7]} levels • Combined cipher techniques
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border/30">
          <h2 className="text-2xl font-semibold mb-4">Scoring System</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center mb-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {config.pointsPerLevel}
              </div>
              <div className="text-sm text-muted-foreground">
                Points per correct answer
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.min(...Object.values(config.maxPointsByDay))}-
                {Math.max(...Object.values(config.maxPointsByDay))}
              </div>
              <div className="text-sm text-muted-foreground">
                Maximum points per day
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {config.totalPossiblePoints}
              </div>
              <div className="text-sm text-muted-foreground">
                Total possible points
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">-10</div>
              <div className="text-sm text-muted-foreground">
                Points per extra attempt
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">-25</div>
              <div className="text-sm text-muted-foreground">
                Points per hint used
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50</div>
              <div className="text-sm text-muted-foreground">
                Minimum points per level
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
