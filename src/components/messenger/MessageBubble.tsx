import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

const MessageBubble = ({ message, isOwnMessage, onSelect, isSelected }: MessageBubbleProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-2 group",
        isOwnMessage && "flex-row-reverse"
      )}
      onClick={onSelect}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {message.sender ? getInitials(message.sender.full_name) : "?"}
        </AvatarFallback>
      </Avatar>
      
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2 cursor-pointer transition-all",
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-muted",
          isSelected && "ring-2 ring-primary"
        )}
      >
        {!isOwnMessage && message.sender && (
          <p className="text-xs font-semibold mb-1">{message.sender.full_name}</p>
        )}
        <p className="text-sm break-words">{message.content}</p>
        <p className={cn(
          "text-xs mt-1",
          isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;