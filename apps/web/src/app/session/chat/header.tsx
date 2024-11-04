import React from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { toast } from "sonner";

export function Header({
  error,
  onNew,
  showNew,
}: {
  error: string | null;
  onNew: () => void;
  showNew: boolean;
}) {
  React.useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: "top-center",
      });
    }
  }, [error]);

  return (
    <div className="w-full border-b bg-background">
      <div className="container flex justify-between items-center py-3">
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-baseline">
            <span className="font-bold text-2xl tracking-tight text-primary">R-Pilot</span>
            <a 
              href="https://markury.dev" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              by Markury
            </a>
          </div>
          {showNew && !error && (
            <Button
              variant="outline"
              onClick={onNew}
              className="text-foreground"
            >
              New chat
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
