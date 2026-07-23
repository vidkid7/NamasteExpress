import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      // Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Placeholder images (seed data)
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      // AWS S3 (future use - uncomment and configure)
      // {
      //   protocol: "https",
      //   hostname: "*.s3.*.amazonaws.com",
      // },
      // Azure Blob Storage (future use - uncomment and configure)
      // {
      //   protocol: "https",
      //   hostname: "*.blob.core.windows.net",
      // },
    ],
  },
};

export default nextConfig;
