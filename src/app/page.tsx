import { GameProvider } from "@/contexts/GameContext";
import GameContainer from "@/components/GameContainer";

export default function Home() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
