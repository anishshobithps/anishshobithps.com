import type { NextRequest } from "next/server";
import { z } from "zod";
import { getTemplate, loadData } from "@/lib/svg/registry";
import { renderError, renderTemplate } from "@repo/svg-kit/render";
import { SvgParamError, type Theme } from "@repo/svg-kit/template";
import type { SvgErrorKind } from "@repo/svg-kit/error";

const HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  "X-Content-Type-Options": "nosniff",
};

const themeSchema = z.enum(["light", "dark"]);

function svgResponse(body: string, status = 200) {
  return new Response(body, { status, headers: HEADERS });
}

async function errorResponse(
  kind: SvgErrorKind,
  message: string,
  theme: Theme,
  status: number,
) {
  return svgResponse(await renderError(kind, message, theme), status);
}

function describeIssue(error: z.ZodError) {
  const [issue] = error.issues;
  if (!issue) return "Invalid parameters.";
  const key = issue.path.join(".");
  return key ? `${key}: ${issue.message}` : issue.message;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = Object.fromEntries(searchParams);

  const theme = themeSchema.safeParse(query.theme);
  if (!theme.success) {
    return errorResponse(
      "bad-params",
      "theme must be light or dark.",
      "light",
      400,
    );
  }

  const type = searchParams.get("type");
  const template = getTemplate(type);
  if (!type || !template) {
    return errorResponse(
      "unknown-type",
      type ? `No card called "${type}".` : "Pass a card with ?type=.",
      theme.data,
      400,
    );
  }

  const params = template.params.safeParse(query);
  if (!params.success) {
    return errorResponse(
      "bad-params",
      describeIssue(params.error),
      theme.data,
      400,
    );
  }

  let data: unknown;
  try {
    data = await loadData(template, params.data);
  } catch (error) {
    if (error instanceof SvgParamError) {
      return errorResponse("bad-params", error.message, theme.data, 400);
    }
    console.error("[svg] %s data failed to load:", type, error);
    return errorResponse(
      "data-unavailable",
      `Couldn't load data for ${type}. Try again later.`,
      theme.data,
      500,
    );
  }

  try {
    return svgResponse(
      await renderTemplate(template, params.data, data, theme.data),
    );
  } catch (error) {
    console.error("[svg] %s failed to render:", type, error);
    return errorResponse(
      "render-failed",
      `Couldn't render ${type}.`,
      theme.data,
      500,
    );
  }
}
