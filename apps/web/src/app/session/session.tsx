"use client";

import React from "react";
import { Message } from "./communication/message";
import ChatInput from "./chat/chat_input";
import ChatHistory from "./chat/chat_history";
import InterpreterIO from "./approval/interpreter_io";
import Interpreter from "./communication/interpreter";
import { useApprover } from "./approval/approver";
import {
  ChatRound,
  ChatRoundState,
} from "./communication/chat_round";
import { Header } from "./chat/header";
import Brand from "./chat/brand";
import useScroller from "../helper/scroller";
import { AUTH_ERROR_MSG, AuthContext } from "../authentication";

export default function Session({
  refreshSession,
  version,
}: {
  refreshSession: () => void;
  version: string;
}) {
  const [history, setHistory] = React.useState<Message[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [showIO, setShowIO] = React.useState<boolean>(false);

  const [chatRoundState, setChatRoundState] =
    React.useState<ChatRoundState>("not active");
  const [approverIn, askApproveIn, autoApproveIn] = useApprover();
  const [approverOut, askApproveOut, autoApproveOut] = useApprover();

  const [codeResult, setCodeResult] = React.useState<string | null>(null);
  const chatInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const interpreterRef = React.useRef<Interpreter | null>(null);
  if (interpreterRef.current === null) {
    interpreterRef.current = new Interpreter();
  }

  const authToken = React.useContext(AuthContext);

  const code = history.findLast((msg) => msg.code !== undefined)?.code ?? null;
  React.useEffect(() => {
    if (code !== null) {
      setShowIO(true);
    }
  }, [code]);

  const focusChatInput = () => {
    setTimeout(() => chatInputRef.current && chatInputRef.current.focus(), 100);
  };
  React.useEffect(focusChatInput, []);

  const startChatRound = (message: string) => {
    if (authToken === null) {
      setError(AUTH_ERROR_MSG);
      return;
    }
    const chatRound = new ChatRound(
      history,
      setHistory,
      approverIn,
      approverOut,
      interpreterRef.current!,
      setChatRoundState,
      setCodeResult,
      authToken,
    );
    chatRound
      .run(message)
      .then(focusChatInput)
      .catch((e) => {
        setError(e.message);
      });
  };

  const scrollRef = useScroller(history);

  return (
    <div className="relative h-full bg-blue-50 overflow-x-hidden">
      <div
        className={`absolute top-0 left-0 h-full flex flex-col items-center transition-all duration-500 ${
          showIO ? "w-1/2" : "w-[calc(100%-100px)]"
        }`}
      >
        <Header
          error={error}
          onNew={refreshSession}
          showNew={history.length > 0}
        />
        <div
          className="flex-1 h-0 overflow-y-auto px-8 flex flex-col w-full max-w-6xl"
          ref={scrollRef}
        >
          {history.length === 0 ? (
            <Brand />
          ) : (
            <ChatHistory
              history={history}
              thinking={chatRoundState === "waiting for model"}
            />
          )}
        </div>
        <div className="px-16 mt-8 mb-4 w-full max-w-4xl">
          <ChatInput
            innerRef={chatInputRef}
            disabled={chatRoundState !== "not active" || error !== null}
            onMessage={startChatRound}
          />
        </div>
        <div className="text-blue-200 text-center text-xs pb-4">
          Version {version}
        </div>
      </div>
      <div
        className={`absolute top-0 right-0 w-1/2 h-full flex flex-col px-4 bg-blue-100 shadow-[0_0_25px_10px_rgba(0,0,0,0.15)] transition-all duration-500 ${
          showIO
            ? ""
            : "translate-x-[calc(100%-100px)] opacity-50 hover:transition-none hover:opacity-100 cursor-pointer"
        }`}
        onClick={() => setShowIO(true)}
      >
        <div className="flex-1 flex flex-col h-0">
          <div className="flex-1 h-0">
            <InterpreterIO
              title="Code"
              content={code}
              askApprove={askApproveIn}
              autoApprove={autoApproveIn}
              approver={approverIn}
              disabled={error !== null}
              busy={false}
              language="r"
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col h-0">
          <div className="flex-1 h-0">
            <InterpreterIO
              title="Result"
              content={codeResult}
              askApprove={askApproveOut}
              autoApprove={autoApproveOut}
              approver={approverOut}
              disabled={error !== null}
              busy={chatRoundState === "waiting for interpreter"}
              language="text"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
