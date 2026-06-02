import { connectDB } from "@/lib/db";
import { FeatureFlag } from "@/models/FeatureFlag";

export const DEFAULT_FLAGS = [
  // ── Freelancer Features ──────────────────────────────────────────
  { key: "fl_workspace",       role: "freelancer", label: "Workspace Dashboard",      description: "Main freelancer landing dashboard with overview stats" },
  { key: "fl_projects",        role: "freelancer", label: "Projects Section",          description: "Browse, accept and manage incoming projects" },
  { key: "fl_capability",      role: "freelancer", label: "Skills & Capability",       description: "Skill set management and portfolio uploads" },
  { key: "fl_earnings",        role: "freelancer", label: "Earnings Dashboard",        description: "Financial overview, payout history, and revenue tracking" },
  { key: "fl_profile",         role: "freelancer", label: "Profile Editing",           description: "Update bio, specializations, and portfolio" },
  { key: "fl_chat",            role: "freelancer", label: "Project Chat",              description: "In-project messaging with client" },
  { key: "fl_scope_upgrades",  role: "freelancer", label: "Scope Upgrade Proposals",  description: "Propose additions to the active project scope" },
  { key: "fl_dispute_flagging",role: "freelancer", label: "Dispute Flagging",          description: "Raise scope or payment disputes" },
  { key: "fl_execution_room",  role: "freelancer", label: "Execution Room",            description: "Active project execution canvas and milestone delivery" },
  { key: "fl_settings",        role: "freelancer", label: "Account Settings",          description: "Notification preferences, password, account management" },
  { key: "fl_support",         role: "freelancer", label: "Support Center",            description: "Contact support, FAQs, and help center" },

  // ── Client Features ──────────────────────────────────────────────
  { key: "cl_workspace",       role: "client", label: "Client Workspace",          description: "Main client dashboard with project overview" },
  { key: "cl_projects",        role: "client", label: "Project Creation",          description: "Create and manage projects" },
  { key: "cl_execution",       role: "client", label: "Execution Room",            description: "Client view of the active execution canvas" },
  { key: "cl_billing",         role: "client", label: "Billing & Payments",        description: "Invoice management, payment history, outstanding balance" },
  { key: "cl_organization",    role: "client", label: "Organization Profile",      description: "Team, company profile, and brand settings" },
  { key: "cl_chat",            role: "client", label: "Project Chat",              description: "In-project messaging with the assigned expert" },
  { key: "cl_scope_builder",   role: "client", label: "Scope Builder",            description: "Build and review project scopes" },
  { key: "cl_scope_upgrades",  role: "client", label: "Scope Upgrade Requests",   description: "Request scope additions during active projects" },
  { key: "cl_dispute_flagging",role: "client", label: "Dispute Flagging",          description: "Raise scope or delivery disputes" },
  { key: "cl_support",         role: "client", label: "Support Center",            description: "Contact support, submit tickets, access help docs" },
];

/**
 * Seeds default feature flags into the DB if they don't exist yet.
 * Safe to call multiple times — only inserts missing keys.
 */
export async function seedFeatureFlags() {
  await connectDB();
  for (const flag of DEFAULT_FLAGS) {
    await FeatureFlag.updateOne(
      { key: flag.key },
      { $setOnInsert: { ...flag, enabled: true } },
      { upsert: true }
    );
  }
}

/**
 * Returns all enabled flag keys for a given role.
 * Server-side only.
 */
export async function getEnabledFlags(role: "freelancer" | "client"): Promise<string[]> {
  await connectDB();
  await seedFeatureFlags();
  const flags = await FeatureFlag.find({ role, enabled: true }).lean();
  return flags.map((f) => f.key);
}
