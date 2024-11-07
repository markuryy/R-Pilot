import { CSSProperties, FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <p
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",

        // Shine effect with custom easing
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [transition:background-position_1.2s_cubic-bezier(0.25,0.8,0.25,1)_infinite]",

        // Enhanced shine gradient
        "bg-[linear-gradient(110deg,transparent_33%,rgba(0,0,0,0.85)_50%,transparent_67%)] dark:bg-[linear-gradient(110deg,transparent_33%,rgba(255,255,255,0.85)_50%,transparent_67%)]",

        className,
      )}
    >
      {children}
    </p>
  );
};

export default AnimatedShinyText;
