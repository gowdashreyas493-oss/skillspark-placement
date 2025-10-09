import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import AIInsightPanel from "./AIInsightPanel";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

interface ChatWindowProps {
  chatId: string;
  userId: string;
}

const ChatWindow = ({ chatId, userId }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const typingTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      markAsRead();
      
      // Subscribe to new messages
      const messageChannel = supabase
        .channel(`messages-${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, async (payload) => {
          const newMsg = payload.new as Message;
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', newMsg.sender_id)
            .single();

          setMessages(prev => [...prev, { ...newMsg, sender }]);
          scrollToBottom();
          markAsRead();
        })
        .subscribe();

      // Subscribe to typing indicators
      const typingChannel = supabase
        .channel(`typing-${chatId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `chat_id=eq.${chatId}`
        }, async (payload) => {
          if (payload.new && payload.new.user_id !== userId) {
            const { data: user } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.user_id)
              .single();

            if (payload.new.is_typing) {
              setIsTyping(prev => [...prev, user?.full_name || 'Someone']);
            } else {
              setIsTyping(prev => prev.filter(name => name !== (user?.full_name || 'Someone')));
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(typingChannel);
      };
    }
  }, [chatId, userId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name, email)
        `)
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    await supabase
      .from('chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', userId);
  };

  const updateTypingIndicator = async (typing: boolean) => {
    await supabase
      .from('typing_indicators')
      .upsert({
        chat_id: chatId,
        user_id: userId,
        is_typing: typing,
        updated_at: new Date().toISOString()
      });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Send typing indicator
    updateTypingIndicator(true);

    // Set timeout to stop typing indicator
    typingTimeout.current = setTimeout(() => {
      updateTypingIndicator(false);
    }, 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    updateTypingIndicator(false);

    try {
      // Insert message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Trigger AI analysis in background
      supabase.functions.invoke('analyze-message', {
        body: {
          messageId: message.id,
          content: newMessage.trim()
        }
      }).then(({ error }) => {
        if (error) {
          console.error('AI analysis error:', error);
        }
      });

      setNewMessage("");
      scrollToBottom();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === userId}
                onSelect={() => setSelectedMessageId(message.id)}
                isSelected={selectedMessageId === message.id}
              />
            ))}
            {isTyping.length > 0 && <TypingIndicator names={isTyping} />}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* AI Insight Panel */}
      {selectedMessageId && (
        <AIInsightPanel
          messageId={selectedMessageId}
          onClose={() => setSelectedMessageId(null)}
        />
      )}
    </div>
  );
};

export default ChatWindow;