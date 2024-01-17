import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@components/ui/hover-card";

interface HoverProps {
  text: string;
  description: string;
}

const Hover: React.FC<HoverProps> = ({ text, description }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span
          className="text-accent-foreground cursor-pointer font-bold"
          aria-label={text}
          aria-haspopup="true"
          aria-expanded="false"
          role="button"
        >
          {" "}
          {text}{" "}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-center">
          <div>
            <h4 className="text-sm font-semibold mb-1">{description}</h4>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default Hover;
