import { z } from "zod";

export function numberFromParam(schema: z.ZodNumber) {
  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, schema);
}
