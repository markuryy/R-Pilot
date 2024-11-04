import React from "react";
import { BiSend } from "react-icons/bi";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ChatInput({
  innerRef,
  disabled,
  onMessage,
}: {
  innerRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  disabled: boolean;
  onMessage: (message: string) => void;
}) {
  const [message, setMessage] = React.useState<string>("");

  const canSend = !disabled && message.length > 0;

  const adjustSize = () => {
    const el = innerRef.current;
    if (el !== null) {
      el.style.height = "0";
      el.style.height = Math.min(el.scrollHeight, 24 * 4) + "px";
    }
  };

  const onSend = () => {
    if (canSend) {
      onMessage(message);
      setMessage("");
      innerRef.current!.value = "";
      adjustSize();
    }
  };

  return (
    <div>
      <div className="flex gap-2 bg-white drop-shadow-sm border border-input rounded-md p-4 focus-within:border-ring">
        <div className="flex-1">
          <Textarea
            ref={innerRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustSize();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSend();
            }}
            disabled={disabled}
            placeholder={disabled ? "Please wait..." : "Type your message"}
            className="min-h-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-hidden border-0 p-0 shadow-none"
            rows={1}
          />
        </div>
        <Button 
          onClick={onSend} 
          disabled={!canSend}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          <BiSend className={canSend ? "text-foreground" : "text-muted-foreground"} />
        </Button>
      </div>
    </div>
  );
}