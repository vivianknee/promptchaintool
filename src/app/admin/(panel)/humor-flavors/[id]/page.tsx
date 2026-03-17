import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import FlavorStepsManager from "../../_components/flavor-steps-manager";

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: flavor } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!flavor) {
    redirect("/admin/humor-flavors");
  }

  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", flavor.id)
    .order("order_by", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/humor-flavors"
          className="text-sm mb-2 inline-block transition-colors"
          style={{ color: "var(--accent)" }}
        >
          &larr; Back to Humor Flavors
        </Link>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          {flavor.slug}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {flavor.description || "No description"}
        </p>
      </div>

      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          Steps ({steps?.length ?? 0})
        </h3>
        <FlavorStepsManager
          flavorId={flavor.id}
          flavorSlug={flavor.slug}
          initialSteps={steps ?? []}
        />
      </div>
    </div>
  );
}
