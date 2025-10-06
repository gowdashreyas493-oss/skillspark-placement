import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, CheckCircle, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function MockInterview() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState<string>("Technical");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per question
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && !isCompleted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && currentQuestion < questions.length - 1) {
      handleNext();
    }
    return () => clearTimeout(timer);
  }, [isStarted, timeLeft, isCompleted]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("mock_interview_questions")
      .select("*")
      .eq("domain", domain)
      .limit(5);

    if (error) {
      toast.error("Failed to load questions");
      return;
    }

    setQuestions(data || []);
    setAnswers(new Array(data?.length || 0).fill(""));
  };

  const handleStart = () => {
    fetchQuestions();
    setIsStarted(true);
    setCurrentQuestion(0);
    setTimeLeft(300);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(300);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsCompleted(true);
    
    // Calculate basic score (random for demo)
    const calculatedScore = Math.floor(Math.random() * 30) + 70;
    setScore(calculatedScore);

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
    await supabase.from("mock_interview_results").insert({
      student_id: studentProfile.id,
      domain,
      score: calculatedScore,
      total_questions: questions.length,
      feedback: "Good performance! Keep practicing to improve further."
    });

    toast.success("Interview completed!");
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
              <CardTitle className="text-3xl">Interview Completed!</CardTitle>
              <CardDescription>Great job on completing the {domain} interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {score}%
                </div>
                <p className="text-muted-foreground">Your Score</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Questions Answered</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Domain</span>
                  <span className="font-medium">{domain}</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Feedback:</p>
                <p className="text-sm">Good performance! Keep practicing to improve further.</p>
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
              <CardTitle className="text-2xl">Mock Interview</CardTitle>
              <CardDescription>Practice your interview skills with timed questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Domain</label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-medium">Instructions:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>You will be asked 5 questions from the selected domain</li>
                  <li>Each question has a 5-minute time limit</li>
                  <li>Provide detailed answers for better evaluation</li>
                  <li>Your responses will be scored automatically</li>
                </ul>
              </div>

              <Button onClick={handleStart} className="w-full" size="lg">
                Start Interview
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
            <span className={timeLeft < 60 ? "text-destructive font-medium" : ""}>
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
              {questions[currentQuestion]?.question}
            </CardTitle>
            <CardDescription>
              Difficulty: {questions[currentQuestion]?.difficulty}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={answers[currentQuestion] || ""}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[currentQuestion] = e.target.value;
                setAnswers(newAnswers);
              }}
              placeholder="Type your answer here..."
              className="min-h-[200px]"
            />

            <div className="flex gap-3">
              {currentQuestion > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="ml-auto"
              >
                {currentQuestion === questions.length - 1 ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit
                  </>
                ) : (
                  "Next Question"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}