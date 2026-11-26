import { ENV } from "varlock/env";
import { siteConfig } from "@repo/core/site-config";
import {
  defineConfig,
  inspectPolicyRules,
  policyMatchers,
  policyRulePresets,
} from "@c15t/backend";

const CONSENT_BASE_PATH = "/api/c15t";

const usOptOut = policyRulePresets.usPrivacyStatesOptOut();

const policyRules = [
  policyRulePresets.europeOptIn(),
  policyRulePresets.quebecOptIn(),
  {
    ...usOptOut,
    match: policyMatchers.merge(
      usOptOut.match,
      policyMatchers.regionFallback(["US"]),
    ),
  },
  policyRulePresets.worldNone(),
];

const { errors } = inspectPolicyRules(policyRules);
if (errors.length > 0) {
  throw new Error(`Invalid consent policy rules: ${JSON.stringify(errors)}`);
}

function databaseUrl(): string {
  if (ENV.C15T_DATABASE_URL) return ENV.C15T_DATABASE_URL;
  if (!ENV.DATABASE_URL) {
    throw new Error("C15T_DATABASE_URL or DATABASE_URL must be set");
  }
  const url = new URL(ENV.DATABASE_URL);
  url.hostname = url.hostname.replace("-pooler.", ".");
  return url.toString();
}

function trustedOrigins(): string[] {
  const origins = [siteConfig.domain, `*.${siteConfig.domain}`];
  if (process.env.NODE_ENV !== "production") {
    origins.push("localhost", "127.0.0.1");
  }
  const preview = process.env.VERCEL_URL;
  if (preview) origins.push(preview);
  return origins;
}

export const consentBackendConfig = defineConfig({
  database: { dialect: "postgres", url: databaseUrl(), schema: "c15t" },
  basePath: CONSENT_BASE_PATH,
  trustedOrigins: trustedOrigins(),
  ipAddress: { tracking: false },
  openapi: { enabled: false },
  manifest: { appName: siteConfig.domain, policyRules },
});
