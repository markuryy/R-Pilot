/* eslint-disable @next/next/no-img-element */
import { Message } from "../communication/message";
import { TbUser } from "react-icons/tb";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from 'remark-gfm';

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

  const CopyButton = ({ content, className = "" }: { content: string, className?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    };

    return (
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 opacity-0 transition-opacity bg-muted/80 text-foreground px-2 py-1 rounded text-xs hover:bg-muted ${className}`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    );
  };

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
                "drop-shadow-sm rounded-xl p-4 relative group max-w-[calc(100%-6rem)] " +
                (msg.role === "user" ? "bg-primary/10" : "bg-card border")
              }
            >
              {msg.text === "" || msg.text === undefined ? (
                "..."
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-0 [&>*+*]:mt-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    urlTransform={(url) => {
                      if (url.startsWith('sandbox:/workspace/')) {
                        const path = url.replace('sandbox:/workspace/', '');
                        return `/api/files/${path}`;
                      }
                      return url;
                    }}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        
                        if (match) {
                          return (
                            <div className="relative group/code" style={{ maxWidth: '100%' }}>
                              <pre style={{ margin: 0, padding: 0 }}>
                                <SyntaxHighlighter
                                  language={match[1]}
                                  style={vscDarkPlus}
                                  customStyle={{
                                    margin: 0,
                                    padding: '0.5rem',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.25',
                                    whiteSpace: 'pre',
                                    overflowX: 'auto',
                                    width: '100%'
                                  }}
                                  wrapLongLines={false}
                                  PreTag="div"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </pre>
                              <CopyButton 
                                content={String(children)} 
                                className="group-hover/code:opacity-100"
                              />
                            </div>
                          );
                        }
                        return (
                          <code className="bg-muted rounded px-1" {...props}>
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
              {msg.role === "model" && msg.text && (
                <CopyButton 
                  content={msg.text} 
                  className="group-hover:opacity-100"
                />
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
