import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Menyembunyikan Dev Indicator secara penuh di Next.js terbaru */
  devIndicators: false,

  /* Config options lainnya */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;