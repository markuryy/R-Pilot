import React from "react";
import type { FC } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Approver } from "./approver";
import Running from "./running";
import useScroller from "../../helper/scroller";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_INTERPRETER_TYPE?: string;
    }
  }
}

// Get interpreter type from environment, defaulting to r
const INTERPRETER_TYPE = process.env.NEXT_PUBLIC_INTERPRETER_TYPE?.toLowerCase() || "r";

interface InterpreterIOProps {
  title: string;
  content: string | null;
  askApprove: boolean;
  approver: Approver;
  autoApprove: boolean;
  disabled: boolean;
  busy: boolean;
  language?: string;
}

const InterpreterIO: FC<InterpreterIOProps> = ({
  title,
  content,
  askApprove,
  approver,
  autoApprove,
  disabled,
  busy,
  language: providedLanguage,  // Allow override but use interpreter-specific default
}) => {
  const scrollRef = useScroller(content);

  // Use provided language or default based on interpreter type
  const language = providedLanguage || (INTERPRETER_TYPE === "r" ? "r" : "python");

  return (
    <div className="h-full flex flex-col">
      <div className="text-xl mt-2 text-primary">{title}</div>
      <Card className={`flex-1 mt-2 ${askApprove ? "border-destructive" : "border-transparent"} border-2`}>
        <ScrollArea 
          ref={scrollRef}
          className={`h-[calc(100%-1rem)] ${busy ? "bg-muted" : "bg-muted/50"}`}
        >
          {busy ? (
            <div className="m-2">
              <Running />
            </div>
          ) : (
            <SyntaxHighlighter
              language={language}
              style={docco}
              className="!overflow-x-visible"
            >
              {content ?? ""}
            </SyntaxHighlighter>
          )}
        </ScrollArea>
      </Card>
      <div className="flex justify-end items-center my-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-approve"
            checked={autoApprove}
            onCheckedChange={(checked) => approver.setAutoApprove(checked as boolean)}
            disabled={disabled}
          />
          <label
            htmlFor="auto-approve"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Auto-approve
          </label>
        </div>
        <Button
          variant="secondary"
          className="ml-4"
          onClick={() => approver.approve(false)}
          disabled={!askApprove || disabled}
        >
          Reject
        </Button>
        <Button
          variant="destructive"
          className="ml-2"
          onClick={() => approver.approve(true)}
          disabled={!askApprove || disabled}
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

export default InterpreterIO;
