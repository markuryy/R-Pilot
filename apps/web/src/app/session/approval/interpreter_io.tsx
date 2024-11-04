import React from "react";
import type { FC, ChangeEvent } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Approver } from "./approver";
import Running from "./running";
import useScroller from "../../helper/scroller";

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

  const handleAutoApproveChange = (e: ChangeEvent<HTMLInputElement>) => {
    approver.setAutoApprove(e.target.checked);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-xl mt-2 text-blue-400">{title}</div>
      <div
        className={`flex-1 ${
          busy ? "bg-neutral-100" : "bg-neutral-50"
        } overflow-auto h-0 mt-2 ${
          askApprove ? "border-red-400" : "border-transparent"
        } border-2`}
        ref={scrollRef}
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
      </div>
      <div className="flex justify-end items-center my-2">
        <div>
          <input
            className="align-middle accent-red-600"
            type="checkbox"
            checked={autoApprove}
            onChange={handleAutoApproveChange}
            disabled={disabled}
          />{" "}
          auto-approve
        </div>
        <button
          className="ml-4 px-4 py-2 bg-blue-400 hover:bg-blue-500 disabled:bg-gray-100 text-white disabled:text-gray-300 rounded-md"
          onClick={() => approver.approve(false)}
          disabled={!askApprove || disabled}
        >
          Reject
        </button>
        <button
          className="ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 text-white disabled:text-gray-300 rounded-md"
          onClick={() => approver.approve(true)}
          disabled={!askApprove || disabled}
        >
          Approve
        </button>
      </div>
    </div>
  );
};

export default InterpreterIO;
