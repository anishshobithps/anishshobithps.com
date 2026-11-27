import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { mergeProps } from "@ui-sdk/react/primitive";

type SlotProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
};

export function Slot({ children, ...props }: SlotProps) {
  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) return null;
  return cloneElement(
    child as ReactElement<Record<string, unknown>>,
    mergeProps(props, child.props),
  );
}
