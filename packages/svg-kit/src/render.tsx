import { renderSvg } from "takumi-js";
import { loadFonts } from "./fonts";
import type { AnySvgTemplate, Theme } from "./template";
import {
  ERROR_SIZE,
  ErrorCard,
  fallbackErrorSvg,
  type SvgErrorKind,
} from "./error";

export async function renderTemplate(
  template: AnySvgTemplate,
  params: unknown,
  data: unknown,
  theme: Theme,
) {
  return renderSvg(template.render({ params, data, theme }), {
    ...template.size(params),
    fonts: await loadFonts(),
  });
}

export async function renderError(
  kind: SvgErrorKind,
  message: string,
  theme: Theme,
) {
  try {
    return await renderSvg(
      <ErrorCard theme={theme} kind={kind} message={message} />,
      { ...ERROR_SIZE, fonts: await loadFonts() },
    );
  } catch (error) {
    console.error("[svg] Error card failed to render:", error);
    return fallbackErrorSvg(message);
  }
}
