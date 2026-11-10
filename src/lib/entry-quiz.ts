import type { EntryQuestionInput } from "./community";

export const MAX_ENTRY_QUESTIONS = 10;

export type ParsedEntryQuestions =
  | { ok: true; questions: EntryQuestionInput[] }
  | { ok: false };

/**
 * Validates the JSON produced by the entry-quiz builder before it reaches the
 * database. Kept pure so it can be unit tested without Supabase.
 */
export function parseEntryQuestions(raw: unknown): ParsedEntryQuestions {
  let value: unknown = raw;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return { ok: true, questions: [] };
    try {
      value = JSON.parse(trimmed);
    } catch {
      return { ok: false };
    }
  }

  if (!Array.isArray(value)) return { ok: false };
  if (value.length > MAX_ENTRY_QUESTIONS) return { ok: false };

  const questions: EntryQuestionInput[] = [];
  const usedIds = new Set<string>();

  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!item || typeof item !== "object") return { ok: false };
    const q = item as Record<string, unknown>;

    const question = typeof q.question === "string" ? q.question.trim() : "";
    if (!question || question.length > 500) return { ok: false };

    const type: "text" | "choice" = q.type === "choice" ? "choice" : "text";

    const options =
      type === "choice" && Array.isArray(q.options)
        ? q.options
            .filter((option): option is string => typeof option === "string")
            .map((option) => option.trim())
            .filter(Boolean)
        : [];

    const correctRaw = q.correct_answer;
    const correct =
      typeof correctRaw === "string"
        ? correctRaw.trim()
        : Array.isArray(correctRaw)
          ? correctRaw
              .filter((option): option is string => typeof option === "string")
              .map((option) => option.trim())
              .filter(Boolean)
          : "";

    if (type === "choice") {
      if (options.length < 2 || options.length > 10) return { ok: false };
      if (typeof correct !== "string" || !correct) return { ok: false };
      if (!options.some((option) => option.toLowerCase() === correct.toLowerCase())) {
        return { ok: false };
      }
    } else if (typeof correct !== "string" || !correct) {
      return { ok: false };
    }

    let id =
      typeof q.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(q.id)
        ? q.id
        : `q${index + 1}`;
    while (usedIds.has(id)) id = `${id}_${index + 1}`;
    usedIds.add(id);

    questions.push({
      id,
      question,
      type,
      ...(type === "choice" ? { options } : {}),
      correct_answer: correct,
    });
  }

  return { ok: true, questions };
}
