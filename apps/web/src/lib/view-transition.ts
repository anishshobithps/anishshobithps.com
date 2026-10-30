export function postTransitionName(url: string): string {
  return `post-${url.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}
