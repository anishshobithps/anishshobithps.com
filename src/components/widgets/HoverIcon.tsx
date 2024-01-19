import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@components/ui/hover-card";
import React from "react";

interface HoverProps {
  description: string;
  children: React.ReactNode;
}

const HoverIcon: React.FC<HoverProps> = ({ children, description }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">{children}</div>
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

export default HoverIcon;
