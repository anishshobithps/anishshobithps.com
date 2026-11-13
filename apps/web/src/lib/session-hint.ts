const SESSION_COOKIE = /(?:^|;\s*)__client_uat(?:_[^=;]+)?=(?!0(?:;|$))[^;]+/;

export function hasSessionHint(cookie: string): boolean {
  return SESSION_COOKIE.test(cookie);
}
