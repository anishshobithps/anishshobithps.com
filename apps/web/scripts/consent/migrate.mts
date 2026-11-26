import { createMigrator } from "@c15t/backend";
import { consentBackendConfig } from "@/lib/consent/backend-config";

async function main() {
  const apply = process.argv.includes("--apply");
  const migrator = createMigrator(consentBackendConfig.database);
  try {
    const report = await (apply ? migrator.apply() : migrator.plan());
    console.log(
      JSON.stringify(
        {
          mode: apply ? "apply" : "plan",
          shape: report.shape,
          pending: report.pending,
          adoption: report.adoption,
          retained: report.retained,
          drift: report.drift,
          blocked: report.blocked ?? null,
          applied: report.applied,
        },
        null,
        2,
      ),
    );
    if (report.blocked) process.exitCode = 1;
  } finally {
    await migrator.dispose();
  }
}

void main();
