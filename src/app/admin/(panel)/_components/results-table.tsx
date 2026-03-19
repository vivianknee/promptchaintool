"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";

type ResponseRow = {
  id: number;
  llm_model_response?: string;
  humor_flavor_id?: number;
  humor_flavor_step_id?: number;
  llm_model_id?: number;
  caption_request_id?: number;
  llm_prompt_chain_id?: number;
  llm_temperature?: number;
  llm_system_prompt?: string;
  llm_user_prompt?: string;
  profile_id?: string;
  [key: string]: unknown;
};

type HumorFlavor = {
  id: number;
  slug: string;
};

export default function ResultsTable({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: ResponseRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<ResponseRow[]>(initialData);
  const [count, setCount] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [flavors, setFlavors] = useState<HumorFlavor[]>([]);
  const [filterFlavorId, setFilterFlavorId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFlavors = async () => {
      const supabase = createClient();
      const { data: flavorRows } = await supabase
        .from("humor_flavors")
        .select("id, slug")
        .order("slug");
      setFlavors(flavorRows ?? []);
    };
    fetchFlavors();
  }, []);

  const fetchData = async (p: number, q: string, flavorId: number | null) => {
    setLoading(true);
    const supabase = createClient();
    const from = p * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("llm_model_responses")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (flavorId) {
      query = query.eq("humor_flavor_id", flavorId);
    }

    if (q) {
      query = query.ilike("llm_model_response", `%${q}%`);
    }

    const { data: rows, count: total } = await query;
    setData(rows ?? []);
    setCount(total ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    if (page === 0 && !search && !filterFlavorId) return;
    fetchData(page, search, filterFlavorId);
  }, [page]);

  useEffect(() => {
    setPage(0);
    fetchData(0, search, filterFlavorId);
  }, [search, filterFlavorId]);

  const columns: Column<ResponseRow>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
          {row.id}
        </span>
      ),
    },
    {
      key: "humor_flavor_id",
      header: "Flavor",
      render: (row) => {
        const flavor = flavors.find((f) => f.id === row.humor_flavor_id);
        return (
          <span className="text-sm">
            {flavor ? flavor.slug : row.humor_flavor_id ?? "—"}
          </span>
        );
      },
    },
    {
      key: "humor_flavor_step_id",
      header: "Step ID",
      render: (row) => (
        <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
          {row.humor_flavor_step_id ?? "—"}
        </span>
      ),
    },
    {
      key: "llm_prompt_chain_id",
      header: "Chain ID",
      render: (row) => (
        <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
          {row.llm_prompt_chain_id ?? "—"}
        </span>
      ),
    },
    {
      key: "llm_model_response",
      header: "Response",
      render: (row) => {
        const text = row.llm_model_response || "—";
        const isExpanded = expandedId === row.id;
        const isLong = text.length > 100;
        return (
          <span
            className="text-sm block max-w-lg cursor-pointer"
            style={{
              color: row.llm_model_response ? "var(--foreground)" : "var(--muted)",
              whiteSpace: isExpanded ? "pre-wrap" : undefined,
            }}
            onClick={() => isLong && setExpandedId(isExpanded ? null : row.id)}
          >
            {isLong && !isExpanded ? text.slice(0, 100) + "..." : text}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Flavor filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Filter by Flavor:
        </label>
        <select
          value={filterFlavorId ?? ""}
          onChange={(e) =>
            setFilterFlavorId(e.target.value ? Number(e.target.value) : null)
          }
          className="px-3 py-2 rounded-lg text-sm outline-none transition-colors cursor-pointer"
          style={{
            background: "var(--subtle-bg)",
            border: "1px solid var(--card-border)",
            color: "var(--foreground)",
          }}
        >
          <option value="">All flavors</option>
          {flavors.map((f) => (
            <option key={f.id} value={f.id}>
              {f.slug}
            </option>
          ))}
        </select>
      </div>

      <DataTable<ResponseRow>
        columns={columns}
        data={data}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by response content..."
        isLoading={loading}
        headerActions={
          <button
            onClick={() => fetchData(page, search, filterFlavorId)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            style={{
              background: "var(--btn-bg)",
              color: "var(--btn-text)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--btn-bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--btn-bg)")
            }
          >
            Refresh
          </button>
        }
      />
    </div>
  );
}
