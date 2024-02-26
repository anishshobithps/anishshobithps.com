import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@components/ui/hover-card";
import React from "react";

interface HoverProps {
  text: string;
  description: string;
}

const Hover: React.FC<HoverProps> = ({ text, description }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span
          className="cursor-pointer font-bold text-accent-foreground"
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
            <h4 className="mb-1 text-sm font-semibold">{description}</h4>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default Hover;
