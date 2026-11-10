import { describe, expect, it } from "vitest";
import { MAX_ENTRY_QUESTIONS, parseEntryQuestions } from "./entry-quiz";

describe("parseEntryQuestions", () => {
  it("treats an empty value as no questions", () => {
    expect(parseEntryQuestions("")).toEqual({ ok: true, questions: [] });
    expect(parseEntryQuestions("   ")).toEqual({ ok: true, questions: [] });
  });

  it("rejects malformed JSON", () => {
    expect(parseEntryQuestions("{not json")).toEqual({ ok: false });
  });

  it("rejects a non-array payload", () => {
    expect(parseEntryQuestions('{"question":"x"}')).toEqual({ ok: false });
  });

  it("accepts a text question and trims values", () => {
    const raw = JSON.stringify([
      { id: "q1", question: "  What is RAVINE?  ", type: "text", correct_answer: "  a platform  " },
    ]);
    expect(parseEntryQuestions(raw)).toEqual({
      ok: true,
      questions: [
        { id: "q1", question: "What is RAVINE?", type: "text", correct_answer: "a platform" },
      ],
    });
  });

  it("accepts a choice question whose answer matches an option", () => {
    const raw = JSON.stringify([
      {
        id: "q1",
        question: "Pick one",
        type: "choice",
        options: ["Red", "Blue"],
        correct_answer: "blue",
      },
    ]);
    const result = parseEntryQuestions(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.questions[0]).toMatchObject({ type: "choice", options: ["Red", "Blue"] });
    }
  });

  it("rejects a choice question whose answer is not an option", () => {
    const raw = JSON.stringify([
      { id: "q1", question: "Pick one", type: "choice", options: ["Red", "Blue"], correct_answer: "Green" },
    ]);
    expect(parseEntryQuestions(raw)).toEqual({ ok: false });
  });

  it("rejects a text question with no answer", () => {
    const raw = JSON.stringify([{ id: "q1", question: "Why?", type: "text", correct_answer: "" }]);
    expect(parseEntryQuestions(raw)).toEqual({ ok: false });
  });

  it("rejects more questions than the limit", () => {
    const raw = JSON.stringify(
      Array.from({ length: MAX_ENTRY_QUESTIONS + 1 }, (_, i) => ({
        id: `q${i + 1}`,
        question: "Q?",
        type: "text",
        correct_answer: "A",
      })),
    );
    expect(parseEntryQuestions(raw)).toEqual({ ok: false });
  });

  it("repairs missing and duplicate ids", () => {
    const raw = JSON.stringify([
      { question: "First?", type: "text", correct_answer: "A" },
      { id: "q1", question: "Second?", type: "text", correct_answer: "B" },
    ]);
    const result = parseEntryQuestions(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.questions.map((q) => q.id)).toEqual(["q1", "q1_2"]);
    }
  });
});
