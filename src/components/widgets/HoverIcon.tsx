import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@components/ui/hover-card";

interface HoverProps {
    description: string;
    children: React.ReactNode;
  }

const HoverIcon: React.FC<HoverProps> = ({ children, description }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
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

export default HoverIcon;