export const STORAGE_KEY = "propanpegel.inputs.v1";
export type Inputs = {
  size: "5" | "8" | "11" | "custom";
  custom: string;
  tare: string;
  total: string;
};
export const defaults: Inputs = { size: "11", custom: "", tare: "", total: "" };
export function loadInputs(): Inputs {
  try {
    const data: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    );
    if (
      data &&
      typeof data === "object" &&
      "size" in data &&
      "custom" in data &&
      "tare" in data &&
      "total" in data &&
      ["5", "8", "11", "custom"].includes(String(data.size)) &&
      typeof data.custom === "string" &&
      typeof data.tare === "string" &&
      typeof data.total === "string"
    )
      return data as Inputs;
  } catch {
    /* Storage is optional (private browsing or malformed data). */
  }
  return { ...defaults };
}
