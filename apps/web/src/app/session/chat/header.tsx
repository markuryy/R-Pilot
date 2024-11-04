import React from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function Header({
  error,
  onNew,
  showNew,
}: {
  error: string | null;
  onNew: () => void;
  showNew: boolean;
}) {
  return (
    <div className="w-full border-b bg-background">
      <div className="container flex justify-between items-center py-2">
        {error !== null ? (
          <Alert variant="destructive" className="flex-1 mr-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        ) : (
          <div className="flex-1">
            {showNew && (
              <Button
                variant="outline"
                onClick={onNew}
                className="text-foreground"
              >
                New chat
              </Button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          {error !== null && (
            <Button
              variant="destructive"
              onClick={onNew}
            >
              Reset
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
