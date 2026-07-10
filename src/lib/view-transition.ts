/**
 * A stable, CSS-`<custom-ident>`-safe `view-transition-name` for a blog post,
 * derived from its URL. Used on both the blog list title and the post heading so
 * the browser morphs one into the other during navigation.
 */
export function postTransitionName(url: string): string {
  return `post-${url.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}
