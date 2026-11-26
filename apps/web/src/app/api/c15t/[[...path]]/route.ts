import { c15tInstance } from "@c15t/backend";
import { consentBackendConfig } from "@/lib/consent/backend-config";

export const runtime = "nodejs";

const backend = c15tInstance(consentBackendConfig);

function handle(request: Request): Promise<Response> {
  return backend.handler(request);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as OPTIONS };
