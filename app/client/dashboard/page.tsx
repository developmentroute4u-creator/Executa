import { redirect } from "next/navigation";

export default function DeprecatedDashboard() {
  redirect("/client/workspace");
}
