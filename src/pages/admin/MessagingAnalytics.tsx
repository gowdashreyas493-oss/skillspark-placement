import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const MessagingAnalytics = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalChats: 0,
    flaggedMessages: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Total chats
      const { count: chatsCount } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true });

      // Flagged messages
      const { count: flaggedCount } = await supabase
        .from('ai_message_analysis')
        .select('*', { count: 'exact', head: true })
        .eq('is_flagged', true);

      // Active users (users with chat participation)
      const { data: participations } = await supabase
        .from('chat_participants')
        .select('user_id');

      const uniqueUsers = new Set(participations?.map(p => p.user_id) || []);

      setStats({
        totalMessages: messagesCount || 0,
        totalChats: chatsCount || 0,
        flaggedMessages: flaggedCount || 0,
        activeUsers: uniqueUsers.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to load messaging statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Messaging Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">{stats.totalMessages}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Chats</p>
              <p className="text-2xl font-bold">{stats.totalChats}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Flagged Messages</p>
              <p className="text-2xl font-bold">{stats.flaggedMessages}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground">
          The messaging system is powered by AI content moderation that analyzes every message for sentiment, credibility, toxicity, and fake news probability. This helps maintain a safe and trustworthy communication environment.
        </p>
      </Card>
    </div>
  );
};

export default MessagingAnalytics;