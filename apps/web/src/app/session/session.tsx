import React from "react";
import { Message } from "./communication/message";
import ChatInput from "./chat/chat_input";
import ChatHistory from "./chat/chat_history";
import InterpreterIO from "./approval/interpreter_io";
import Interpreter from "./communication/interpreter";
import { useApprover } from "./approval/approver";
import { ChatRound, ChatRoundState } from "./communication/chat_round";
import { Header } from "./chat/header";
import Brand from "./chat/brand";
import useScroller from "../helper/scroller";
import { AUTH_ERROR_MSG, AuthContext } from "../authentication";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Session({
  refreshSession,
  version,
}: {
  refreshSession: () => void;
  version: string;
}) {
  const [history, setHistory] = React.useState<Message[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [chatRoundState, setChatRoundState] = React.useState<ChatRoundState>("not active");
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
  const scrollRef = useScroller(history);

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

  return (
    <div className="h-full bg-background flex flex-col">
      <Header
        error={error}
        onNew={refreshSession}
        showNew={history.length > 0}
      />
      <div className="container flex-1 py-4 overflow-hidden flex flex-col min-h-0">
        <div className="grid flex-1 gap-4 grid-cols-2 min-h-0">
          <div className="flex flex-col min-h-0">
            
            <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
              {history.length === 0 ? (
                <Brand />
              ) : (
                <ChatHistory
                  history={history}
                  thinking={chatRoundState === "waiting for model"}
                />
              )}
            </ScrollArea>
            <div className="pt-4">
              <ChatInput
                innerRef={chatInputRef}
                disabled={chatRoundState !== "not active" || error !== null}
                onMessage={startChatRound}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
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
            <div className="flex-1 min-h-0">
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
        <div className="text-center text-xs text-muted-foreground pt-4">
          Version {version}
        </div>
      </div>
    </div>
  );
}
