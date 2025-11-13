import { Gamepad2, Trophy, Sparkles } from "lucide-react";
import { TamilMatchingGame } from "@/components/TamilMatchingGame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Games = () => {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          Learning Games
        </h1>
        <p className="text-muted-foreground">Practice Tamil through fun, interactive games</p>
      </div>

      {/* Featured Game */}
      <div className="relative">
        <div className="absolute -top-3 left-4 z-10">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 rounded-full shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span className="font-bold text-sm">Featured Game</span>
          </div>
        </div>
        <TamilMatchingGame />
      </div>

      {/* Coming Soon Section */}
      <Card className="bg-gradient-to-br from-muted/50 to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            More Games Coming Soon!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card text-center">
              <div className="text-4xl mb-2">📚</div>
              <h4 className="font-semibold mb-1">Word Builder</h4>
              <p className="text-sm text-muted-foreground">Build Tamil words from letters</p>
            </div>
            <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card text-center">
              <div className="text-4xl mb-2">⚡</div>
              <h4 className="font-semibold mb-1">Grammar Quiz</h4>
              <p className="text-sm text-muted-foreground">Test your Tamil grammar skills</p>
            </div>
            <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h4 className="font-semibold mb-1">Speed Reading</h4>
              <p className="text-sm text-muted-foreground">Improve reading comprehension</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Games;
