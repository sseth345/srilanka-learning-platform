import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trophy, RefreshCw, Star, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Word {
  tamil: string;
  english: string;
  id: number;
}

const wordPairs: Word[] = [
  { tamil: 'வணக்கம்', english: 'Hello', id: 1 },
  { tamil: 'நன்றி', english: 'Thank you', id: 2 },
  { tamil: 'குடும்பம்', english: 'Family', id: 3 },
  { tamil: 'நண்பன்', english: 'Friend', id: 4 },
  { tamil: 'புத்தகம்', english: 'Book', id: 5 },
  { tamil: 'பள்ளி', english: 'School', id: 6 },
  { tamil: 'வீடு', english: 'House', id: 7 },
  { tamil: 'சாப்பாடு', english: 'Food', id: 8 },
  { tamil: 'நீர்', english: 'Water', id: 9 },
  { tamil: 'காலை', english: 'Morning', id: 10 },
  { tamil: 'இரவு', english: 'Night', id: 11 },
  { tamil: 'சூரியன்', english: 'Sun', id: 12 },
];

interface GameCard {
  id: number;
  value: string;
  type: 'tamil' | 'english';
  pairId: number;
  isMatched: boolean;
  isFlipped: boolean;
}

export const TamilMatchingGame = () => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  useEffect(() => {
    if (selectedCards.length === 2) {
      setMoves((prev) => prev + 1);
      checkMatch();
    }
  }, [selectedCards]);

  const initializeGame = () => {
    // Select 6 random word pairs for the game
    const shuffled = [...wordPairs].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffled.slice(0, 6);

    // Create cards for tamil and english
    const gameCards: GameCard[] = [];
    selectedPairs.forEach((pair) => {
      gameCards.push({
        id: gameCards.length,
        value: pair.tamil,
        type: 'tamil',
        pairId: pair.id,
        isMatched: false,
        isFlipped: false,
      });
      gameCards.push({
        id: gameCards.length,
        value: pair.english,
        type: 'english',
        pairId: pair.id,
        isMatched: false,
        isFlipped: false,
      });
    });

    // Shuffle cards
    setCards(gameCards.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setScore(0);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped || selectedCards.length >= 2) {
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setSelectedCards((prev) => [...prev, cardId]);
  };

  const checkMatch = () => {
    setTimeout(() => {
      const [firstId, secondId] = selectedCards;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          )
        );
        setScore((prev) => prev + 10);
        toast({
          title: '🎉 Perfect Match!',
          description: `${firstCard.type === 'tamil' ? firstCard.value : secondCard.value} = ${firstCard.type === 'english' ? firstCard.value : secondCard.value}`,
        });

        // Check if game is completed
        const allMatched = cards.every(
          (c) =>
            c.isMatched ||
            c.id === firstId ||
            c.id === secondId
        );
        if (allMatched) {
          setGameCompleted(true);
          const finalScore = score + 10 + Math.max(0, 100 - moves * 2);
          setScore(finalScore);
          toast({
            title: '🏆 Game Completed!',
            description: `Amazing! Your final score is ${finalScore}`,
          });
        }
      } else {
        // No match
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          )
        );
      }

      setSelectedCards([]);
    }, 800);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Tamil Vocabulary Matching
          </CardTitle>
          <Button variant="outline" size="sm" onClick={initializeGame} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            New Game
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-lg">{score} Points</span>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Moves: {moves}
          </Badge>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-lg">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Game Completed Message */}
        {gameCompleted && (
          <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              You completed the game in {moves} moves and {formatTime(timeElapsed)}!
            </p>
            <div className="text-3xl font-bold text-primary mb-4">
              Final Score: {score}
            </div>
            <Button onClick={initializeGame} size="lg" className="gap-2">
              <RefreshCw className="h-5 w-5" />
              Play Again
            </Button>
          </div>
        )}

        {/* Game Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square rounded-lg cursor-pointer transition-all duration-300 transform
                ${
                  card.isMatched
                    ? 'bg-green-500 text-white scale-95 cursor-default'
                    : card.isFlipped
                    ? card.type === 'tamil'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-muted to-muted/50 hover:scale-105 hover:shadow-lg'
                }
                flex items-center justify-center p-4 text-center font-bold
                ${!card.isFlipped && !card.isMatched ? 'hover:bg-muted/80' : ''}
              `}
            >
              {card.isFlipped || card.isMatched ? (
                <span className={card.type === 'tamil' ? 'text-2xl' : 'text-lg'}>
                  {card.value}
                </span>
              ) : (
                <span className="text-4xl opacity-20">?</span>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        {!gameStarted && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Click on cards to flip them and find matching Tamil-English pairs!
              <br />
              Match all 6 pairs to win the game 🎯
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

