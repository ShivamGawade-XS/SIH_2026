export const SESSION_COOKIE_NAME = "honeychain_session";

export interface DemoOfficer {
  email: string;
  password: string;
  name: string;
  role: "FIELD_OFFICER" | "LAB_ANALYST" | "ADMIN";
  cooperative: string;
}

export const DEMO_OFFICERS: DemoOfficer[] = [
  {
    email: "officer@kvic.gov.in",
    password: "kvic2026password",
    name: "Dr. Ananya Ray",
    role: "FIELD_OFFICER",
    cooperative: "KVIC-BH-002",
  },
  {
    email: "lab@bee-board.gov.in",
    password: "lab2026password",
    name: "K. S. Narayanan (Chief Chemist)",
    role: "LAB_ANALYST",
    cooperative: "NBB-DEL-LAB-01",
  },
  {
    email: "admin@truetag.in",
    password: "admin2026password",
    name: "Shivam Gawade (TrueTag Director)",
    role: "ADMIN",
    cooperative: "TRUETAG-HQ",
  },
];
