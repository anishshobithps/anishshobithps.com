import { useBoolean } from "hooks/useBoolean";
import type { ComponentChildren } from "preact";
import { CornerDownLeft, Menu as MenuIcon, X } from "preact-feather";
import ThemeToggler from "./ThemeToggler";

interface Props {
  children: ComponentChildren;
}

const Menu = ({ children }: Props) => {
  const { value: isOpen, off, toggle } = useBoolean();
  const Icon = isOpen ? X : MenuIcon;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        class="p-2 hover:scale-110 active:scale-90 transition-transform"
      >
        <Icon size={24} />
      </button>
      {isOpen && (
        <div class="relative -z-10">
          <div class="flex flex-col justify-center items-center gap-12 fixed top-0 left-0 w-screen h-screen px-8 py-20 bg-slate-100 dark:bg-slate-900 border-b border-b-slate-700 animate-[menu_0.6s_ease]">
            <nav class="flex flex-col gap-4">{children}</nav>
            <div class="space-x-4">
              <ThemeToggler />
              <button
                type="button"
                onClick={off}
                aria-label="Close menu"
                class="p-2 hover:scale-110 active:scale-90 transition-transform"
              >
                <CornerDownLeft size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Menu;
