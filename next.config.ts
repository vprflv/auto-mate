import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/vin/decode": [
      "./scripts/decode_vin.py",
      "./scripts/vin_version_lookup.py",
      "./scripts/vin_decoding_policy.py",
      "./features/catalog/lib/vinDecodingPolicy.json",
      "./features/garage/add/lib/bmwTypeCodes.json",
    ],
  },
};

export default nextConfig;
