// One-off script: extracts ABIs from Foundry build output into app/lib/abis/*.ts
// Run with: node sync-abis.mjs
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const contracts = ["AgriToken", "BatchRegistry", "FairPriceOracle", "WeighbridgeRegistry", "Escrow", "Forwarder"];
const outDir = join(import.meta.dirname, "out");
const targetDir = join(import.meta.dirname, "..", "app", "lib", "abis");
mkdirSync(targetDir, { recursive: true });

for (const name of contracts) {
  const artifactPath = join(outDir, `${name}.sol`, `${name}.json`);
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
  const varName = name.charAt(0).toLowerCase() + name.slice(1) + "Abi";
  const content = `// Auto-generated from contracts/out/${name}.sol/${name}.json — do not hand-edit.\n// Regenerate with: node contracts/sync-abis.mjs\nexport const ${varName} = ${JSON.stringify(artifact.abi, null, 2)} as const;\n`;
  writeFileSync(join(targetDir, `${name}.ts`), content);
  console.log(`wrote ${name}.ts`);
}
