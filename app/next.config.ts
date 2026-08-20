import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Desktop/ has a stray package-lock.json from an unrelated project; pin the root explicitly
    // so Turbopack doesn't try to treat it as this project's workspace root.
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
