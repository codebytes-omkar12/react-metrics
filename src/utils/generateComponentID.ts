// utils/getCallerComponentId.ts
export function generateComponentId(): string {
  const error = new Error();
  const stackLines = error.stack?.split("\n") || [];

  // Find the first user-defined component (not a utility function)
  const line = stackLines.find(
    (l) =>
      l.includes("at ") &&
      !l.includes("generateComponentId") &&
      !l.includes("usePerformanceMonitor") &&
      !l.includes("Object.<anonymous>")
  );

  const match = line?.match(/at (.+?) \(/);
  const rawName = match?.[1]?.trim() ?? "UnknownComponent";

  // Strip any prefixes like "Object.", "Module.", etc.
  const cleanedName = rawName.split(".").pop();

  return cleanedName || "UnknownComponent";
}

