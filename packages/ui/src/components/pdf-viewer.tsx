"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  Children,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import {
  NumberInput,
  NumberInputControl,
} from "@ui-sdk/react/number-input";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
} from "@ui-sdk/react/toolbar";

import { Button, buttonVariants } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import {
  CaretLeftIcon,
  CaretRightIcon,
  DownloadIcon,
  ArrowSquareOutIcon,
  ArrowClockwiseIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@repo/ui/icons";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const Document = dynamic(() => import("react-pdf").then((m) => m.Document), {
  ssr: false,
});
const Page = dynamic(() => import("react-pdf").then((m) => m.Page), {
  ssr: false,
});

interface PdfContextValue {
  file: string;
  downloadHref: string;
  numPages: number | null;
  currentPage: number;
  goToPage: (page: number) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  reload: () => void;
  containerWidth: number;
  loading: boolean;
}

type DocState = {
  numPages: number | null;
  currentPage: number;
  docKey: number;
  loading: boolean;
  rendered: boolean;
};

type DocAction =
  | { type: "reload" }
  | { type: "loaded"; numPages: number }
  | { type: "load-failed" }
  | { type: "rendered" }
  | { type: "go-to-page"; page: number };

const initialDocState: DocState = {
  numPages: null,
  currentPage: 1,
  docKey: 0,
  loading: true,
  rendered: false,
};

function docReducer(state: DocState, action: DocAction): DocState {
  switch (action.type) {
    case "reload":
      return { ...initialDocState, docKey: state.docKey + 1 };
    case "loaded":
      return { ...state, numPages: action.numPages, loading: false };
    case "load-failed":
      return { ...state, loading: false };
    case "rendered":
      return { ...state, rendered: true };
    case "go-to-page":
      return {
        ...state,
        currentPage: Math.min(Math.max(action.page, 1), state.numPages ?? 1),
      };
  }
}

const ZOOM = { min: 0.5, max: 3, step: 0.1 };

function clampZoom(value: number) {
  return Math.min(ZOOM.max, Math.max(ZOOM.min, +value.toFixed(1)));
}

const PdfContext = createContext<PdfContextValue | null>(null);

export function usePdf() {
  const ctx = useContext(PdfContext);
  if (!ctx) throw new Error("Pdf components must be inside <PdfViewer>");
  return ctx;
}

interface PdfViewerProps extends HTMLAttributes<HTMLDivElement> {
  file: string;
  downloadHref?: string;
  children?: ReactNode;
  loader?: ReactNode;
  deferMs?: number;
  startOnInteraction?: boolean;
}

export const PdfViewer = forwardRef<HTMLDivElement, PdfViewerProps>(
  ({ file, downloadHref, children, loader, deferMs = 0, startOnInteraction = false, className, ...props }, ref) => {
    const [doc, dispatch] = useReducer(docReducer, initialDocState);
    const { numPages, currentPage, docKey, loading, rendered } = doc;
    const [zoom, setZoom] = useState(1);

    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [workerReady, setWorkerReady] = useState(false);

    useEffect(() => {
      let cancelled = false;
      let started = false;
      const events = [
        "pointerdown",
        "pointermove",
        "keydown",
        "scroll",
        "touchstart",
        "wheel",
      ] as const;

      const stopListening = () => {
        window.clearTimeout(timer);
        for (const name of events) window.removeEventListener(name, start);
      };

      function start() {
        if (started) return;
        started = true;
        stopListening();
        import("react-pdf").then(({ pdfjs }) => {
          if (cancelled) return;
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.min.mjs",
            import.meta.url,
          ).toString();
          setWorkerReady(true);
        });
      }

      const timer = window.setTimeout(start, deferMs);
      if (startOnInteraction) {
        for (const name of events) {
          window.addEventListener(name, start, { passive: true });
        }
      }

      return () => {
        cancelled = true;
        stopListening();
      };
    }, [deferMs, startOnInteraction]);

    const onResize = useCallback<ResizeObserverCallback>((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    }, []);

    useResizeObserver(containerRef, {}, onResize);

    const reload = useCallback(() => dispatch({ type: "reload" }), []);
    const goToPage = useCallback(
      (page: number) => {
        dispatch({ type: "go-to-page", page });
        containerRef
          ?.querySelector(`[data-page-number="${page}"]`)
          ?.scrollIntoView({ block: "start", behavior: "smooth" });
      },
      [containerRef],
    );

    const onScroll = useCallback(() => {
      if (!containerRef) return;
      const line = containerRef.scrollTop + containerRef.clientHeight / 3;
      let page = 1;
      for (const node of containerRef.querySelectorAll<HTMLElement>(
        "[data-page-number]",
      )) {
        if (node.offsetTop <= line) page = Number(node.dataset.pageNumber);
      }
      if (page !== currentPage) dispatch({ type: "go-to-page", page });
    }, [containerRef, currentPage]);

    const pageWidth = containerWidth > 0 ? Math.min(containerWidth, 900) : null;

    const childArray = Children.toArray(children);
    const toolbar = childArray[0];
    const footer =
      childArray.length > 1 ? childArray[childArray.length - 1] : null;

    return (
      <PdfContext.Provider
        value={{
          file,
          downloadHref: downloadHref ?? file,
          numPages,
          currentPage,
          goToPage,
          zoom,
          setZoom,
          reload,
          containerWidth,
          loading,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative flex h-full flex-col overflow-hidden border border-border",
            className,
          )}
          {...props}
        >
          {toolbar}

          <div
            ref={setContainerRef}
            tabIndex={0}
            role="region"
            aria-label="Document pages"
            onScroll={numPages && numPages > 1 ? onScroll : undefined}
            className="relative flex-1 overflow-auto bg-muted/10 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
          >
            {!rendered && (loading || numPages) && (
              <div
                aria-hidden="true"
                className="mx-auto my-4 aspect-[1/1.4142] w-[min(calc(100%-2px),900px)] bg-background"
              />
            )}

            {workerReady && pageWidth && (
              <div className={cn(!rendered && "absolute inset-x-0 top-0")}>
                <Document
                  key={docKey}
                  file={file}
                  loading={null}
                  onLoadSuccess={({ numPages }) =>
                    dispatch({ type: "loaded", numPages })
                  }
                  onLoadError={() => dispatch({ type: "load-failed" })}
                  className="flex flex-col items-center gap-4 py-4"
                >
                  {Array.from({ length: numPages ?? 0 }, (_, i) => (
                    <Page
                      key={i + 1}
                      pageNumber={i + 1}
                      width={pageWidth - 2}
                      scale={zoom}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onRenderSuccess={() => {
                        if (i === 0) dispatch({ type: "rendered" });
                      }}
                    />
                  ))}
                </Document>
              </div>
            )}

            {(loading || !workerReady) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                {loader ?? (
                  <div className="text-sm text-muted-foreground">
                    Loading document...
                  </div>
                )}
              </div>
            )}
          </div>
          {footer}
        </div>
      </PdfContext.Provider>
    );
  },
);

PdfViewer.displayName = "PdfViewer";

export const PdfViewerToolbar = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Toolbar
    ref={ref}
    aria-label="Document controls"
    className={cn(
      "flex items-center gap-2 border-b border-border bg-background px-3 py-2 sm:px-4",
      className,
    )}
    {...props}
  />
));
PdfViewerToolbar.displayName = "PdfViewerToolbar";

export const PdfViewerFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t border-border bg-background px-4 py-2", className)}
    {...props}
  />
));
PdfViewerFooter.displayName = "PdfViewerFooter";

export const PdfViewerFilename = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { name?: string }
>(({ name, className, ...props }, ref) => {
  const { file } = usePdf();
  const label = name ?? file.split("/").pop() ?? file;
  return (
    <span
      ref={ref}
      className={cn("min-w-0 flex-1 truncate font-mono text-muted-foreground", className)}
      {...props}
    >
      <Text as="span" variant="none" className="text-[11px]">
        {label}
      </Text>
    </span>
  );
});
PdfViewerFilename.displayName = "PdfViewerFilename";

export const PdfViewerControls = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-1", className)} {...props} />
);

const iconButton = <Button variant="outline" size="icon" />;

const joinedStart = "rounded-r-none";
const joinedEnd = "rounded-l-none";
const joinedField =
  "h-9 w-14 border-y border-input bg-transparent px-1 text-center font-mono text-xs tabular-nums outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export const PdfViewerPagination = ({
  "aria-label": label = "Page navigation",
}: {
  "aria-label"?: string;
}) => {
  const { currentPage, goToPage, numPages } = usePdf();
  if (!numPages || numPages <= 1) return null;

  return (
    <ToolbarGroup aria-label={label} className="flex items-center">
      <ToolbarButton
        aria-label="Previous page"
        data-sound="flip"
        disabled={currentPage <= 1}
        className={joinedStart}
        render={iconButton}
        onClick={() => goToPage(currentPage - 1)}
      >
        <CaretLeftIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <NumberInput
        value={currentPage}
        min={1}
        max={numPages}
        step={1}
        onValueChange={(page) => {
          if (page !== null) goToPage(page);
        }}
      >
        <ToolbarInput
          render={
            <NumberInputControl
              aria-label={`Page, of ${numPages}`}
              className={joinedField}
            />
          }
        />
      </NumberInput>
      <ToolbarButton
        aria-label="Next page"
        data-sound="flip"
        disabled={currentPage >= numPages}
        className={joinedEnd}
        render={iconButton}
        onClick={() => goToPage(currentPage + 1)}
      >
        <CaretRightIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>
    </ToolbarGroup>
  );
};

export const PdfViewerZoom = ({
  "aria-label": label = "Zoom controls",
}: {
  "aria-label"?: string;
}) => {
  const { zoom, setZoom } = usePdf();

  return (
    <ToolbarGroup aria-label={label} className="flex items-center">
      <ToolbarButton
        aria-label="Zoom out"
        disabled={zoom <= ZOOM.min}
        className={joinedStart}
        render={iconButton}
        onClick={() => setZoom((z) => clampZoom(z - ZOOM.step))}
      >
        <MagnifyingGlassMinusIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <NumberInput
        value={zoom}
        min={ZOOM.min}
        max={ZOOM.max}
        step={ZOOM.step}
        format={{ style: "percent" }}
        onValueChange={(value) => {
          if (value !== null) setZoom(clampZoom(value));
        }}
      >
        <ToolbarInput
          render={
            <NumberInputControl aria-label="Zoom" className={joinedField} />
          }
        />
      </NumberInput>
      <ToolbarButton
        aria-label="Zoom in"
        disabled={zoom >= ZOOM.max}
        className={joinedEnd}
        render={iconButton}
        onClick={() => setZoom((z) => clampZoom(z + ZOOM.step))}
      >
        <MagnifyingGlassPlusIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>
    </ToolbarGroup>
  );
};

export const PdfViewerReload = ({
  "aria-label": label = "Reload PDF",
}: {
  "aria-label"?: string;
}) => {
  const { reload } = usePdf();
  return (
    <ToolbarButton aria-label={label} render={iconButton} onClick={reload}>
      <ArrowClockwiseIcon className="size-4" aria-hidden="true" />
    </ToolbarButton>
  );
};

export const PdfViewerOpen = ({
  "aria-label": label = "Open PDF in new tab",
}: {
  "aria-label"?: string;
}) => {
  const { file } = usePdf();
  return (
    <ToolbarLink
      href={file}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={buttonVariants({ variant: "outline", size: "icon" })}
    >
      <ArrowSquareOutIcon className="size-4" aria-hidden="true" />
    </ToolbarLink>
  );
};

export const PdfViewerDownload = ({
  label,
  "aria-label": ariaLabel,
}: {
  label?: string;
  "aria-label"?: string;
}) => {
  const { downloadHref } = usePdf();
  return (
    <ToolbarLink
      href={downloadHref}
      data-sound="download"
      aria-label={ariaLabel ?? (label ? `${label}, download as PDF` : "Download as PDF")}
      className={cn(buttonVariants({ size: "sm" }), "px-2 sm:px-3")}
    >
      <DownloadIcon className="size-4" aria-hidden="true" />
      {label && (
        <span className="hidden sm:inline" aria-hidden="true">
          <Text as="span" variant="none">
            {label}
          </Text>
        </span>
      )}
    </ToolbarLink>
  );
};
