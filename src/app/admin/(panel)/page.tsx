import { createClient } from "@/app/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [flavorsRes, stepsRes, chainsRes] = await Promise.all([
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
    supabase.from("humor_flavor_steps").select("*", { count: "exact", head: true }),
    supabase.from("llm_prompt_chains").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Humor Flavors", count: flavorsRes.count ?? 0 },
    { label: "Flavor Steps", count: stepsRes.count ?? 0 },
    { label: "Prompt Chains", count: chainsRes.count ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Dashboard
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Overview of your prompt chain tool
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-6 shadow-sm transition-colors"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {stat.label}
            </p>
            <p
              className="text-3xl font-bold mt-1"
              style={{ color: "var(--foreground)" }}
            >
              {stat.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
