import { ArrowUp } from "preact-feather";

const BackToTop = () => (
  <button
    type="button"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    aria-label="Back to top"
    class="p-2 hover:scale-110 active:scale-90 transition-transform"
  >
    <ArrowUp size={24} />
  </button>
);

export default BackToTop;
