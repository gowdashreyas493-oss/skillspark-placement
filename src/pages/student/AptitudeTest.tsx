import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, Trophy, Target } from "lucide-react";
import { toast } from "sonner";

export default function AptitudeTest() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("Quantitative");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && !isCompleted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [isStarted, timeLeft, isCompleted]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("aptitude_test_questions")
      .select("*")
      .eq("category", category)
      .limit(10);

    if (error) {
      toast.error("Failed to load questions");
      return;
    }

    setQuestions(data || []);
    setSelectedAnswers(new Array(data?.length || 0).fill(""));
  };

  const handleStart = () => {
    fetchQuestions();
    setIsStarted(true);
    setCurrentQuestion(0);
    setTimeLeft(1800);
  };

  const handleSubmit = async () => {
    setIsCompleted(true);
    
    // Calculate score
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correctAnswers++;
      }
    });

    const calculatedScore = correctAnswers;
    const calculatedAccuracy = (correctAnswers / questions.length) * 100;
    const calculatedRank = Math.floor(Math.random() * 50) + 1; // Random rank for demo

    setScore(calculatedScore);
    setAccuracy(calculatedAccuracy);
    setRank(calculatedRank);

    // Get student profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!studentProfile) return;

    // Save results
    await supabase.from("aptitude_test_results").insert({
      student_id: studentProfile.id,
      category,
      score: calculatedScore,
      total_questions: questions.length,
      accuracy: calculatedAccuracy,
      time_taken: 1800 - timeLeft,
      rank: calculatedRank
    });

    toast.success("Test completed!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="border-success/50 shadow-glow">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mb-4 animate-scale-in">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl">Test Completed!</CardTitle>
              <CardDescription>Your {category} test results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{score}/{questions.length}</div>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success">{accuracy.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-info">#{rank}</div>
                  <p className="text-sm text-muted-foreground">Rank</p>
                </div>
              </div>

              <Progress value={accuracy} className="h-3" />

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Category</span>
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time Taken</span>
                  <span className="font-medium">{formatTime(1800 - timeLeft)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Correct Answers</span>
                  <span className="font-medium">{score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Wrong Answers</span>
                  <span className="font-medium">{questions.length - score}</span>
                </div>
              </div>

              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="border-primary/20 shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl">Aptitude Test</CardTitle>
              <CardDescription>Test your skills in various categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quantitative">Quantitative</SelectItem>
                    <SelectItem value="Logical">Logical Reasoning</SelectItem>
                    <SelectItem value="Verbal">Verbal Ability</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-medium">Test Instructions:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Total questions: 10</li>
                  <li>Time limit: 30 minutes</li>
                  <li>Each question has 4 options</li>
                  <li>No negative marking</li>
                  <li>You can review and change answers before submission</li>
                </ul>
              </div>

              <Button onClick={handleStart} className="w-full" size="lg">
                <Target className="mr-2 h-5 w-5" />
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className={timeLeft < 300 ? "text-destructive font-medium" : ""}>
              Time: {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-6" />

        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle className="text-xl">
              Q{currentQuestion + 1}. {questions[currentQuestion]?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedAnswers[currentQuestion]}
              onValueChange={(value) => {
                const newAnswers = [...selectedAnswers];
                newAnswers[currentQuestion] = value;
                setSelectedAnswers(newAnswers);
              }}
            >
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="flex-1 cursor-pointer">
                      {questions[currentQuestion]?.[`option_${option.toLowerCase()}`]}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              {currentQuestion > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  Previous
                </Button>
              )}
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="ml-auto"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="ml-auto"
                >
                  Submit Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex gap-2 flex-wrap">
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={selectedAnswers[index] ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestion(index)}
              className={currentQuestion === index ? "ring-2 ring-primary" : ""}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}