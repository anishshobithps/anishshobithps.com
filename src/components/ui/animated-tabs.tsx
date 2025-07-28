"use client";

import * as React from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Separator as UiSeparator } from "@/components/ui/separator";
import { LucideIcon } from "lucide-react";
import { Small } from "@/components/ui/typography";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: readonly TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition: Transition = {
  delay: 0.1,
  type: "spring",
  bounce: 0,
  duration: 0.6,
};

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement | null>(null);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-sm",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return (
            <UiSeparator
              key={`separator-${index}`}
              orientation="vertical"
              className="h-6"
            />
          );
        }

        const Icon = tab.icon;
        const isSelected = selected === index;

        return (
          <motion.div
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isSelected}
            transition={transition}
          >
            <Button
              variant={isSelected ? "secondary" : "ghost"}
              onClick={() => handleSelect(index)}
              className={cn(
                "flex items-center transition-all duration-300",
                isSelected && activeColor
              )}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.span
                    variants={spanVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                    className="ml-2 overflow-hidden"
                  >
                    <Small className="leading-none">{tab.title}</Small>
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}