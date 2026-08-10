#!/usr/bin/env node
/**
 * CI dependency audit: fail on high/critical findings except documented allowlist.
 * Allowlist entries must include a reason and (ideally) a tracking note.
 */
import { spawnSync } from "node:child_process";

/** @type {Record<string, string>} */
const ALLOWED_HIGH = {
  // Community SheetJS build — no patched release on npm; used only by offline import scripts.
  xlsx:
    "No patched npm release; CLI-only import scripts (not runtime web surface).",
};

const result = spawnSync("npm", ["audit", "--json"], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

let report;
try {
  report = JSON.parse(result.stdout || "{}");
} catch {
  console.error("Failed to parse npm audit JSON.");
  console.error(result.stdout);
  console.error(result.stderr);
  process.exit(1);
}

const vulns = Object.values(report.vulnerabilities ?? {});
const blocking = vulns.filter((v) => {
  const severity = v.severity;
  if (severity !== "high" && severity !== "critical") return false;
  if (ALLOWED_HIGH[v.name]) return false;
  return true;
});

const allowed = vulns.filter(
  (v) =>
    (v.severity === "high" || v.severity === "critical") &&
    ALLOWED_HIGH[v.name],
);

if (allowed.length) {
  console.log("Allowed high/critical advisories:");
  for (const v of allowed) {
    console.log(`- ${v.name}: ${ALLOWED_HIGH[v.name]}`);
  }
}

if (blocking.length) {
  console.error("Blocking high/critical advisories:");
  for (const v of blocking) {
    const via = (v.via ?? [])
      .map((item) => (typeof item === "string" ? item : item.title || item.url))
      .filter(Boolean)
      .slice(0, 3)
      .join("; ");
    console.error(`- ${v.name} (${v.severity})${via ? `: ${via}` : ""}`);
  }
  process.exit(1);
}

console.log("npm audit: no blocking high/critical vulnerabilities.");
process.exit(0);
