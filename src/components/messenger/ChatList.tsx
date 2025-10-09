import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface Chat {
  id: string;
  type: string;
  name: string | null;
  created_at: string;
  lastMessage?: {
    content: string;
    created_at: string;
  };
  otherParticipant?: {
    full_name: string;
    email: string;
  };
  unreadCount: number;
}

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  userId: string;
}

const ChatList = ({ selectedChatId, onSelectChat, userId }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();

    // Subscribe to new chats
    const channel = supabase
      .channel('chat-list-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats'
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchChats = async () => {
    try {
      // Get all chats the user participates in
      const { data: participations, error: partError } = await supabase
        .from('chat_participants')
        .select('chat_id, last_read_at')
        .eq('user_id', userId);

      if (partError) throw partError;

      const chatIds = participations?.map(p => p.chat_id) || [];
      
      if (chatIds.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Get chat details
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // For each chat, get the last message and participant info
      const enrichedChats = await Promise.all(
        (chatsData || []).map(async (chat) => {
          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('chat_id', chat.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const participation = participations?.find(p => p.chat_id === chat.id);
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .neq('sender_id', userId)
            .gt('created_at', participation?.last_read_at || new Date(0).toISOString());

          // If direct chat, get other participant
          let otherParticipant;
          if (chat.type === 'direct') {
            const { data: participants } = await supabase
              .from('chat_participants')
              .select('user_id')
              .eq('chat_id', chat.id)
              .neq('user_id', userId);

            if (participants && participants.length > 0) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', participants[0].user_id)
                .single();

              otherParticipant = profile;
            }
          }

          return {
            ...chat,
            lastMessage: lastMsg || undefined,
            otherParticipant,
            unreadCount: unreadCount || 0
          };
        })
      );

      setChats(enrichedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Unnamed Group';
    }
    return chat.otherParticipant?.full_name || chat.otherParticipant?.email || 'Unknown User';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-center text-muted-foreground">
        <p>No chats yet. Start a new conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
              selectedChatId === chat.id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(getChatDisplayName(chat))}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {getChatDisplayName(chat)}
                  </h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.lastMessage.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage?.content || 'No messages yet'}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatList;