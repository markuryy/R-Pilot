import React, { useRef } from "react";
import { BiSend } from "react-icons/bi";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IoMdAttach, IoMdClose } from "react-icons/io";

interface AttachedFile {
  name: string;
  path: string;
}

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
  const [attachedFiles, setAttachedFiles] = React.useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = !disabled && (message.length > 0 || attachedFiles.length > 0);

  const adjustSize = () => {
    const el = innerRef.current;
    if (el !== null) {
      el.style.height = "0";
      const maxHeight = 24 * 4;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  };

  const onSend = () => {
    if (canSend) {
      const fileLinks = attachedFiles.map(file => `[${file.name}](${file.path})`);
      const fullMessage = [message, ...fileLinks].filter(Boolean).join("\n");
      onMessage(fullMessage);
      setMessage("");
      setAttachedFiles([]);
      innerRef.current!.value = "";
      adjustSize();
    }
  };

  const validateAndUploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Only CSV files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newFile = {
          name: file.name,
          path: `/workspace/${file.name}`
        };
        setAttachedFiles(prev => [...prev, newFile]);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await validateAndUploadFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await validateAndUploadFile(file);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card
      className={`p-4 rounded-xl ${isDragging ? 'border-primary border-2' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
            >
              <span className="truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <IoMdClose className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".csv"
          disabled={disabled}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          <IoMdAttach className={disabled ? "text-muted-foreground" : "text-foreground"} />
        </Button>
        <div className="flex-1">
          <Textarea
            ref={innerRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustSize();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            disabled={disabled}
            placeholder={disabled ? "Please wait..." : "Type your message"}
            className="min-h-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none border-0 p-0 shadow-none bg-transparent text-base leading-relaxed"
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
    </Card>
  );
}
