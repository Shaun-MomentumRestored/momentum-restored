import { cookies } from "next/headers";
import CoachLogin from "@/components/coach/CoachLogin";
import CoachNavBar from "@/components/coach/CoachNavBar";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("coach_session")?.value === "true";

  if (!isAuth) {
    return <CoachLogin />;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoachNavBar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">{children}</main>
    </div>
  );
}
