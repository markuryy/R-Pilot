import { Message } from "../communication/message";
import { TbUser } from "react-icons/tb";
import React from "react";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

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
                  <AvatarFallback className="bg-primary">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                {thinking && idx === historyFiltered.length - 1 && (
                  <img
                    src="/thinking.gif"
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
                "drop-shadow-sm rounded-xl p-4 " +
                (msg.role === "user" ? "bg-primary/10" : "bg-card border")
              }
            >
              {msg.text === "" || msg.text === undefined ? (
                "..."
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap [&>table]:border-collapse [&>table]:w-full [&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-border [&>table>thead>tr>th]:p-2 [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-border [&>table>tbody>tr>td]:p-2">
                  <ReactMarkdown
                    urlTransform={(url) => {
                      if (url.startsWith('sandbox:/workspace/')) {
                        const path = url.replace('sandbox:/workspace/', '');
                        return `/api/files/${path}`;
                      }
                      return url;
                    }}
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
                      },
                      table(props) {
                        return (
                          <div className="overflow-x-auto">
                            <table {...props} />
                          </div>
                        );
                      },
                      a({ href, children }) {
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline"
                          >
                            {children}
                          </a>
                        );
                      },
                      img({ src = '', alt }) {
                        return (
                          <img
                            src={src.startsWith('sandbox:/workspace/') 
                              ? `/api/files/${src.replace('sandbox:/workspace/', '')}`
                              : src}
                            alt={alt}
                            className="max-w-full h-auto"
                          />
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
                  <AvatarFallback className="bg-primary">
                    <TbUser className="h-5 w-5 text-primary-foreground" />
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
