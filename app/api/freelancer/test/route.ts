import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";
import { FreelancerProfile } from "@/models/FreelancerProfile";

const TASK_BANK: Record<string, Record<string, { prompt: string; requirements: string[] }>> = {
  development: {
    frontend: {
      prompt: "Build a responsive task management board component. The component should support multiple columns (Todo, In Progress, Done), drag-to-reorder cards within a column, card creation with title and priority, and persistent state. Focus on clean state management, edge case handling, and production-ready code quality.",
      requirements: [
        "Multiple swimlane columns with drag-and-drop reordering",
        "Card CRUD: create, edit, delete, mark complete",
        "Priority levels: low, medium, high, critical with visual indicators",
        "Optimistic UI updates with error rollback",
        "Empty states, loading states, error states handled",
        "Keyboard accessibility (ARIA compliant)",
        "Local state persistence across page reloads",
      ],
    },
    backend: {
      prompt: "Design and implement a RESTful API for a booking system. Include endpoints for resource availability checking, booking creation with conflict detection, cancellation with refund logic, and waitlist management. Handle edge cases around double-booking, timezone differences, and concurrent requests.",
      requirements: [
        "Resource availability endpoint with time-range queries",
        "Booking creation with real-time conflict detection",
        "Cancellation flow with configurable refund windows",
        "Waitlist system with automatic promotion",
        "Rate limiting and input validation",
        "Comprehensive error responses with actionable messages",
        "Unit tests for conflict detection logic",
      ],
    },
    fullstack: {
      prompt: "Build a complete user authentication system with role-based access control. Include registration, login, email verification, password reset, session management, and an admin panel for user management. Demonstrate full-stack thinking from database schema to UI.",
      requirements: [
        "Registration with email verification flow",
        "JWT + refresh token architecture",
        "Role-based route protection (user, admin, moderator)",
        "Password reset via email with expiring tokens",
        "Admin panel: list, search, deactivate users",
        "Rate limiting on auth endpoints",
        "Security audit: SQL injection, XSS, CSRF protections documented",
      ],
    },
    mobile: {
      prompt: "Build a mobile expense tracker app. Users can log expenses by category, set monthly budgets, view spending analytics, and receive budget alerts. Focus on offline-first architecture, smooth animations, and intuitive UX patterns.",
      requirements: [
        "Expense logging: amount, category, date, notes, receipt photo",
        "Budget management per category with visual progress",
        "Analytics: weekly/monthly breakdowns, trends",
        "Push notifications for budget thresholds",
        "Offline mode with background sync",
        "Biometric authentication option",
        "CSV export functionality",
      ],
    },
  },
  design: {
    ui_ux: {
      prompt: "Design a complete onboarding flow for a B2B SaaS analytics platform. The product helps data teams track KPIs and build reports. Design for first-time users who need to connect a data source, configure their first dashboard, and invite team members. Deliver high-fidelity screens and an interactive prototype.",
      requirements: [
        "Welcome screen with role selection (analyst, manager, exec)",
        "Data source connection: guided step-by-step with validation",
        "Dashboard template gallery with preview and selection",
        "Team invitation: bulk email input, role assignment",
        "Progress indicator and skip options throughout",
        "Empty states with next-action prompts",
        "Success screen with quick-start guide",
      ],
    },
    branding: {
      prompt: "Create a complete brand identity system for a fintech startup called 'Vault' — a personal finance platform targeting young professionals. Develop logo, color system, typography, and usage guidelines that feel premium, trustworthy, and modern without feeling corporate.",
      requirements: [
        "Primary logo + wordmark + icon-only variants",
        "Color palette: primary, secondary, semantic (success/error/warning)",
        "Typography system: heading, body, UI, mono scales",
        "Brand voice and tone guidelines",
        "Application samples: mobile app screen, marketing email header",
        "Dark mode adaptations",
        "Logo misuse examples",
      ],
    },
  },
};

// POST /api/freelancer/test/start
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "freelancer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { field, domain, specialization } = await req.json();
    await connectDB();
    const userId = (session.user as any).id;

    const existing = await Test.findOne({ freelancerId: userId, status: { $in: ["assigned", "in_progress", "submitted", "under_review"] } });
    if (existing) return NextResponse.json({ error: "Active test already exists", testId: existing._id }, { status: 409 });

    const taskData = TASK_BANK[field]?.[domain] || TASK_BANK.development.frontend;

    const test = await Test.create({
      freelancerId: userId,
      field,
      domain,
      specialization,
      level: 2,
      taskPrompt: taskData.prompt,
      taskRequirements: taskData.requirements,
      status: "assigned",
    });

    await FreelancerProfile.findOneAndUpdate(
      { userId },
      { testStatus: "in_progress" }
    );

    return NextResponse.json({ testId: test._id.toString(), test });
  } catch (err) {
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 });
  }
}

// GET /api/freelancer/test/start — get current test
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const test = await Test.findOne({ freelancerId: userId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ test });
}

// PATCH /api/freelancer/test — Start the assigned custom test
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const userId = (session.user as any).id;

    const test = await Test.findOne({ freelancerId: userId, status: "assigned" }).sort({ createdAt: -1 });
    if (!test) return NextResponse.json({ error: "No assigned test found" }, { status: 404 });

    test.status = "in_progress";
    await test.save();

    await FreelancerProfile.findOneAndUpdate(
      { userId },
      { testStatus: "in_progress" }
    );

    return NextResponse.json({ success: true, test });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

