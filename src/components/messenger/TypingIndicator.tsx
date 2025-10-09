interface TypingIndicatorProps {
  names: string[];
}

const TypingIndicator = ({ names }: TypingIndicatorProps) => {
  const displayText = names.length === 1
    ? `${names[0]} is typing`
    : `${names.join(", ")} are typing`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span>{displayText}...</span>
    </div>
  );
};

export default TypingIndicator;