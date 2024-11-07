import React from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ChevronRight } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";

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
        
        <div className="flex items-center gap-3">
        <ModeToggle />
          <a 
            href="https://github.com/markuryy/R-Pilot"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <IconBrandGithub className="mr-1.5 h-4 w-4" />
                <span>View on GitHub</span>
                <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedShinyText>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
