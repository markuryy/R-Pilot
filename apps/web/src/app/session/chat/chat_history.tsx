import { Message } from "../communication/message";
import { TbUser } from "react-icons/tb";
import React from "react";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ChatHistory({
  history,
  thinking,
}: {
  history: Message[];
  thinking: boolean;
}) {
  const historyFiltered = history.filter(
    (msg, idx) =>
      msg.role === "user" ||
      (msg.role === "model" &&
        (msg.text !== undefined || (thinking && idx == history.length - 1))),
  );

  return (
    <ScrollArea className="mt-auto">
      <div className="pr-4">
        {historyFiltered.map((msg, idx) => (
          <div key={idx} className="flex mt-4">
            {msg.role === "model" ? (
              <div className="mr-4 mt-2 min-w-[36px] relative">
                <Avatar>
                  <AvatarImage src="./icon.png" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                {thinking && idx === historyFiltered.length - 1 && (
                  <img
                    src="./thinking.gif"
                    alt="thinking"
                    className="absolute block w-[30px] top-[-20px] right-[-30px] z-10"
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 min-w-[20px]" />
            )}
            <div
              className={
                "drop-shadow-sm rounded-md p-4 " +
                (msg.role === "user" ? "bg-blue-100" : "bg-card")
              }
            >
              {msg.text === "" || msg.text === undefined ? (
                "..."
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const {children, className, ...rest} = props;
                        return (
                          <code
                            className={`text-foreground ${className || ''} ${
                              !className?.includes('language-') ? 'bg-muted rounded px-1' : 'block bg-muted p-2 rounded'
                            }`}
                            {...rest}
                          >
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            {msg.role === "user" ? (
              <div className="ml-4 mt-2">
                <Avatar>
                  <AvatarFallback>
                    <TbUser className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex-1 min-w-[20px]" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
