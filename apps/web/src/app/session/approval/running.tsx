import React from "react";
import { Loader2 } from "lucide-react";

export default function Running() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Running</span>
    </div>
  );
}
