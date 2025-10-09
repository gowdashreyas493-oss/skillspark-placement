import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, TrendingUp, Shield, AlertTriangle, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AIAnalysis {
  sentiment_score: number;
  credibility_score: number;
  toxicity_score: number;
  fake_news_probability: number;
  threat_level: string;
  is_flagged: boolean;
  flag_reason: string;
}

interface AIInsightPanelProps {
  messageId: string;
  onClose: () => void;
}

const AIInsightPanel = ({ messageId, onClose }: AIInsightPanelProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [messageId]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_message_analysis')
        .select('*')
        .eq('message_id', messageId)
        .maybeSingle();

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 0.3) return "text-green-600";
    if (score < 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getThreatBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      none: "secondary",
      low: "default",
      medium: "default",
      high: "destructive"
    };
    return <Badge variant={variants[level] || "default"}>{level.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="w-80 border-l bg-card p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="w-80 border-l bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          This message hasn't been analyzed yet. Analysis is processed in the background.
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-card p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Sentiment Score */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold">Sentiment</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Score</span>
              <span className={getScoreColor(Math.abs(analysis.sentiment_score))}>
                {analysis.sentiment_score > 0 ? "Positive" : analysis.sentiment_score < 0 ? "Negative" : "Neutral"}
              </span>
            </div>
            <Progress
              value={((analysis.sentiment_score + 1) / 2) * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Credibility Score */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-semibold">Credibility</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Score</span>
              <span className={getScoreColor(1 - analysis.credibility_score)}>
                {(analysis.credibility_score * 100).toFixed(0)}%
              </span>
            </div>
            <Progress
              value={analysis.credibility_score * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Toxicity Score */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h4 className="text-sm font-semibold">Toxicity</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Score</span>
              <span className={getScoreColor(analysis.toxicity_score)}>
                {(analysis.toxicity_score * 100).toFixed(0)}%
              </span>
            </div>
            <Progress
              value={analysis.toxicity_score * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Fake News Probability */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h4 className="text-sm font-semibold">Fake News Probability</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Probability</span>
              <span className={getScoreColor(analysis.fake_news_probability)}>
                {(analysis.fake_news_probability * 100).toFixed(0)}%
              </span>
            </div>
            <Progress
              value={analysis.fake_news_probability * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Threat Level */}
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Threat Level</h4>
            {getThreatBadge(analysis.threat_level)}
          </div>
        </div>

        {/* Flagged Status */}
        {analysis.is_flagged && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="text-sm font-semibold text-destructive mb-1">⚠️ Flagged Content</h4>
            <p className="text-xs text-destructive/80">{analysis.flag_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightPanel;