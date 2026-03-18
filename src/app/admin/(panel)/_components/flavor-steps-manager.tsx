"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";
import ConfirmDialog from "./confirm-dialog";
import FormModal, { type FieldConfig } from "./form-modal";

type StepRow = {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  description?: string;
  llm_system_prompt?: string;
  llm_user_prompt?: string;
  llm_temperature?: number;
  llm_model_id?: number;
  llm_input_type_id?: number;
  llm_output_type_id?: number;
  humor_flavor_step_type_id?: number;
  created_datetime_utc?: string;
  [key: string]: unknown;
};

type LlmModel = {
  id: number;
  name: string;
  provider_model_id: string;
};

type LookupRow = {
  id: number;
  slug: string;
  description?: string;
};

export default function FlavorStepsManager({
  flavorId,
  flavorSlug,
  initialSteps,
}: {
  flavorId: number;
  flavorSlug: string;
  initialSteps: StepRow[];
}) {
  const [data, setData] = useState<StepRow[]>(initialSteps);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<LlmModel[]>([]);
  const [inputTypes, setInputTypes] = useState<LookupRow[]>([]);
  const [outputTypes, setOutputTypes] = useState<LookupRow[]>([]);
  const [stepTypes, setStepTypes] = useState<LookupRow[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StepRow | null>(null);
  const [deletingItem, setDeletingItem] = useState<StepRow | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Fetch LLM models and lookup tables for select dropdowns
  useEffect(() => {
    const fetchLookups = async () => {
      const supabase = createClient();
      const [modelsRes, inputRes, outputRes, stepTypesRes] = await Promise.all([
        supabase.from("llm_models").select("id, name, provider_model_id").order("name"),
        supabase.from("llm_input_types").select("id, slug, description").order("id"),
        supabase.from("llm_output_types").select("id, slug, description").order("id"),
        supabase.from("humor_flavor_step_types").select("id, slug, description").order("id"),
      ]);
      setModels(modelsRes.data ?? []);
      setInputTypes(inputRes.data ?? []);
      setOutputTypes(outputRes.data ?? []);
      setStepTypes(stepTypesRes.data ?? []);
    };
    fetchLookups();
  }, []);

  const fields: FieldConfig[] = [
    {
      key: "order_by",
      label: "Order",
      type: "number",
      required: true,
      placeholder: "1, 2, 3...",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      placeholder: "What this step does...",
    },
    {
      key: "llm_system_prompt",
      label: "System Prompt",
      type: "textarea",
      required: true,
      placeholder: "System instructions for the LLM...",
    },
    {
      key: "llm_user_prompt",
      label: "User Prompt",
      type: "textarea",
      required: true,
      placeholder: "User prompt template...",
    },
    {
      key: "llm_temperature",
      label: "Temperature",
      type: "number",
      required: true,
      placeholder: "0.7",
    },
    {
      key: "llm_model_id",
      label: "LLM Model",
      type: "select",
      required: true,
      options: models.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.provider_model_id})`,
      })),
    },
    {
      key: "llm_input_type_id",
      label: "Input Type",
      type: "select",
      required: true,
      options: inputTypes.map((t) => ({
        value: t.id,
        label: t.description ? `${t.slug} — ${t.description}` : t.slug,
      })),
    },
    {
      key: "llm_output_type_id",
      label: "Output Type",
      type: "select",
      required: true,
      options: outputTypes.map((t) => ({
        value: t.id,
        label: t.description ? `${t.slug} — ${t.description}` : t.slug,
      })),
    },
    {
      key: "humor_flavor_step_type_id",
      label: "Step Type",
      type: "select",
      required: true,
      options: stepTypes.map((t) => ({
        value: t.id,
        label: t.description ? `${t.slug} — ${t.description}` : t.slug,
      })),
    },
  ];

  const fetchSteps = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: rows } = await supabase
      .from("humor_flavor_steps")
      .select("*")
      .eq("humor_flavor_id", flavorId)
      .order("order_by", { ascending: true });
    setData(rows ?? []);
    setLoading(false);
  };

  const filteredData = search
    ? data.filter(
        (row) =>
          row.description?.toLowerCase().includes(search.toLowerCase()) ||
          row.llm_system_prompt?.toLowerCase().includes(search.toLowerCase()) ||
          row.llm_user_prompt?.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const handleCreate = async (formData: Record<string, unknown>) => {
    const supabase = createClient();
    const { error } = await supabase.from("humor_flavor_steps").insert({
      humor_flavor_id: flavorId,
      order_by: formData.order_by,
      description: formData.description || null,
      llm_system_prompt: formData.llm_system_prompt,
      llm_user_prompt: formData.llm_user_prompt,
      llm_temperature: formData.llm_temperature,
      llm_model_id: formData.llm_model_id,
      llm_input_type_id: formData.llm_input_type_id,
      llm_output_type_id: formData.llm_output_type_id,
      humor_flavor_step_type_id: formData.humor_flavor_step_type_id,
    });
    if (error) throw new Error(error.message);
    showMessage("Step created successfully.", "success");
    fetchSteps();
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!editingItem) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("humor_flavor_steps")
      .update({
        order_by: formData.order_by,
        description: formData.description || null,
        llm_system_prompt: formData.llm_system_prompt,
        llm_user_prompt: formData.llm_user_prompt,
        llm_temperature: formData.llm_temperature,
        llm_model_id: formData.llm_model_id,
        llm_input_type_id: formData.llm_input_type_id,
        llm_output_type_id: formData.llm_output_type_id,
        humor_flavor_step_type_id: formData.humor_flavor_step_type_id,
      })
      .eq("id", editingItem.id);
    if (error) throw new Error(error.message);
    showMessage("Step updated successfully.", "success");
    setEditingItem(null);
    fetchSteps();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("humor_flavor_steps")
      .delete()
      .eq("id", deletingItem.id);
    if (error) {
      showMessage(`Delete failed: ${error.message}`, "error");
    } else {
      showMessage("Step deleted.", "success");
      fetchSteps();
    }
    setDeletingItem(null);
  };

  const handleMoveStep = async (step: StepRow, direction: "up" | "down") => {
    const sorted = [...data].sort((a, b) => a.order_by - b.order_by);
    const currentIndex = sorted.findIndex((s) => s.id === step.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetStep = sorted[targetIndex];
    const supabase = createClient();

    // Use a temporary value to avoid unique constraint violation on (humor_flavor_id, order_by)
    const tempOrder = -1;

    const { error: error1 } = await supabase
      .from("humor_flavor_steps")
      .update({ order_by: tempOrder })
      .eq("id", step.id);

    const { error: error2 } = await supabase
      .from("humor_flavor_steps")
      .update({ order_by: step.order_by })
      .eq("id", targetStep.id);

    const { error: error3 } = await supabase
      .from("humor_flavor_steps")
      .update({ order_by: targetStep.order_by })
      .eq("id", step.id);

    if (error1 || error2 || error3) {
      showMessage("Failed to reorder steps.", "error");
    } else {
      showMessage("Step reordered.", "success");
      fetchSteps();
    }
  };

  const columns: Column<StepRow>[] = [
    {
      key: "order_by",
      header: "Order",
      render: (row) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-mono font-bold">{row.order_by}</span>
          <div className="flex flex-col">
            <button
              onClick={() => handleMoveStep(row, "up")}
              className="text-xs cursor-pointer px-1 leading-none"
              style={{ color: "var(--muted)" }}
              title="Move up"
            >
              ▲
            </button>
            <button
              onClick={() => handleMoveStep(row, "down")}
              className="text-xs cursor-pointer px-1 leading-none"
              style={{ color: "var(--muted)" }}
              title="Move down"
            >
              ▼
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <span
          className="text-sm truncate block max-w-[200px]"
          style={{ color: row.description ? "var(--foreground)" : "var(--muted)" }}
          title={row.description ?? ""}
        >
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "llm_system_prompt",
      header: "System Prompt",
      render: (row) => (
        <span
          className="text-xs truncate block max-w-[200px] font-mono"
          style={{ color: "var(--muted)" }}
          title={row.llm_system_prompt ?? ""}
        >
          {row.llm_system_prompt
            ? row.llm_system_prompt.length > 60
              ? row.llm_system_prompt.slice(0, 60) + "..."
              : row.llm_system_prompt
            : "—"}
        </span>
      ),
    },
    {
      key: "llm_user_prompt",
      header: "User Prompt",
      render: (row) => (
        <span
          className="text-xs truncate block max-w-[200px] font-mono"
          style={{ color: "var(--muted)" }}
          title={row.llm_user_prompt ?? ""}
        >
          {row.llm_user_prompt
            ? row.llm_user_prompt.length > 60
              ? row.llm_user_prompt.slice(0, 60) + "..."
              : row.llm_user_prompt
            : "—"}
        </span>
      ),
    },
    {
      key: "llm_temperature",
      header: "Temp",
      render: (row) => (
        <span className="text-sm font-mono">{row.llm_temperature ?? "—"}</span>
      ),
    },
    {
      key: "llm_model_id",
      header: "Model",
      render: (row) => {
        const model = models.find((m) => m.id === row.llm_model_id);
        return (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {model ? model.name : row.llm_model_id ?? "—"}
          </span>
        );
      },
    },
  ];

  return (
    <>
      {message && (
        <div
          className="rounded-lg px-4 py-2.5 text-sm mb-4"
          style={{
            background:
              message.type === "success"
                ? "var(--vote-up-hover-bg)"
                : "var(--vote-down-hover-bg)",
            color:
              message.type === "success"
                ? "var(--vote-up-hover-text)"
                : "var(--vote-down-hover-text)",
          }}
        >
          {message.text}
        </div>
      )}

      <DataTable<StepRow>
        columns={columns}
        data={filteredData}
        totalCount={filteredData.length}
        page={0}
        pageSize={100}
        onPageChange={() => {}}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search steps by description or prompt..."
        isLoading={loading}
        headerActions={
          <button
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
          >
            Add Step
          </button>
        }
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setEditingItem(row);
                setFormOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
              Edit
            </button>
            <button
              onClick={() => setDeletingItem(row)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{ background: "#dc2626", color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#b91c1c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#dc2626")
              }
            >
              Delete
            </button>
          </div>
        )}
      />

      <FormModal
        isOpen={formOpen}
        title={
          editingItem
            ? `Edit Step #${editingItem.order_by}`
            : `Add Step to "${flavorSlug}"`
        }
        fields={fields}
        initialValues={editingItem ?? {}}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSave={editingItem ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        isOpen={deletingItem !== null}
        title="Delete Step"
        message={`Are you sure you want to delete step #${deletingItem?.order_by}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
}
