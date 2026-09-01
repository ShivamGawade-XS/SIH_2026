/**
 * Demo Authentication Constants for HoneyChain by TrueTag
 * Passwords sourced from environment variables with safe fallback for offline demo.
 * In production, all credentials must be stored in secure vaults (AWS Secrets Manager / Vault).
 */

export const SESSION_COOKIE_NAME = "honeychain_session";

export interface DemoOfficer {
  email: string;
  password: string;
  name: string;
  role: "FIELD_OFFICER" | "LAB_ANALYST" | "ADMIN";
  cooperative: string;
}

// Credentials are read from environment variables.
// In production, fallback plaintext passwords are fully disabled for security.
const IS_PROD = process.env.NODE_ENV === "production";
const OFFICER_PASS = process.env.DEMO_OFFICER_PASS || (IS_PROD ? "" : "kvic2026password");
const LAB_PASS = process.env.DEMO_LAB_PASS || (IS_PROD ? "" : "lab2026password");
const ADMIN_PASS = process.env.DEMO_ADMIN_PASS || (IS_PROD ? "" : "admin2026password");

export const DEMO_OFFICERS: DemoOfficer[] = [
  {
    email: "officer@kvic.gov.in",
    password: OFFICER_PASS,
    name: "Dr. Ananya Ray",
    role: "FIELD_OFFICER",
    cooperative: "KVIC-BH-002",
  },
  {
    email: "lab@bee-board.gov.in",
    password: LAB_PASS,
    name: "K. S. Narayanan (Chief Chemist)",
    role: "LAB_ANALYST",
    cooperative: "NBB-DEL-LAB-01",
  },
  {
    email: "admin@truetag.in",
    password: ADMIN_PASS,
    name: "Shivam Gawade (TrueTag Director)",
    role: "ADMIN",
    cooperative: "TRUETAG-HQ",
  },
];
