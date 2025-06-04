import { z } from "zod";

// ========================================
// Configuration Schema
// ========================================

export const SXTConfigSchema = z.object({
  userId: z.string().describe("Space and Time user ID"),
  authCode: z.string().describe("Authentication code"),
  signature: z.string().describe("Encoded signature"),
  publicKey: z.string().describe("Base64 encoded public key"),
  baseUrl: z
    .string()
    .optional()
    .default("https://api.spaceandtime.io")
    .describe("Space and Time API base URL"),
  scheme: z.string().optional().default("https").describe("API scheme (http/https)"),
});

export type SXTConfig = z.infer<typeof SXTConfigSchema>;

// ========================================
// Default Configuration
// ========================================

export const defaultSXTConfig: SXTConfig = {
  userId: process.env.SXT_USER_ID || "",
  authCode: process.env.SXT_AUTH_CODE || "",
  signature: process.env.SXT_SIGNATURE || "",
  publicKey: process.env.SXT_PUBLIC_KEY || "",
  baseUrl: process.env.SXT_BASE_URL || "https://api.spaceandtime.io",
  scheme: process.env.SXT_SCHEME || "https",
};

// ========================================
// Configuration Validation
// ========================================

export function validateSXTConfig(config: Partial<SXTConfig>): SXTConfig {
  return SXTConfigSchema.parse({
    ...defaultSXTConfig,
    ...config,
  });
}
