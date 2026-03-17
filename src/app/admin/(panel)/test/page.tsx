import TestRunner from "../_components/test-runner";

export default function TestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Test Flavor
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Upload an image and generate captions using a humor flavor
        </p>
      </div>
      <TestRunner />
    </div>
  );
}
