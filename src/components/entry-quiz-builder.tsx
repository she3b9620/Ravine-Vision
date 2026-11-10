"use client";

import { useState } from "react";
import type { EntryQuestionInput } from "@/lib/community";

type Draft = {
  id: string;
  question: string;
  type: "text" | "choice";
  options: string;
  correct_answer: string;
};

function toDrafts(initial: EntryQuestionInput[] | undefined): Draft[] {
  return (initial ?? []).map((question, index) => ({
    id: question.id || `q${index + 1}`,
    question: question.question,
    type: question.type,
    options: (question.options ?? []).join(", "),
    correct_answer: Array.isArray(question.correct_answer)
      ? (question.correct_answer[0] ?? "")
      : (question.correct_answer ?? ""),
  }));
}

/**
 * Dynamic list of entry-quiz questions. Serialises the list into the hidden
 * `entry_questions` field that server actions validate. Correct answers are only
 * ever sent to the save RPC and are stored privately by the database.
 */
export default function EntryQuizBuilder({
  locale,
  initial,
}: {
  locale: string;
  initial?: EntryQuestionInput[];
}) {
  const ar = locale === "ar";
  const [items, setItems] = useState<Draft[]>(() => toDrafts(initial));
  const [nextId, setNextId] = useState(items.length + 1);

  const update = (index: number, patch: Partial<Draft>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const add = () => {
    setItems((prev) => [
      ...prev,
      { id: `q${nextId}`, question: "", type: "text", options: "", correct_answer: "" },
    ]);
    setNextId((n) => n + 1);
  };

  const remove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const serialized = JSON.stringify(
    items
      .filter((item) => item.question.trim())
      .map((item) => ({
        id: item.id,
        question: item.question.trim(),
        type: item.type,
        ...(item.type === "choice"
          ? { options: item.options.split(",").map((option) => option.trim()).filter(Boolean) }
          : {}),
        correct_answer: item.correct_answer.trim(),
      })),
  );

  return (
    <div className="entry-quiz-builder">
      <input type="hidden" name="entry_questions" value={serialized} />

      {items.length === 0 && (
        <p className="creator-muted">
          {ar ? "لا توجد أسئلة بعد. الاختبار اختياري." : "No questions yet. The quiz is optional."}
        </p>
      )}

      {items.map((item, index) => (
        <fieldset key={item.id} className="quiz-builder-item">
          <legend>{ar ? `سؤال ${index + 1}` : `Question ${index + 1}`}</legend>

          <label>
            {ar ? "نص السؤال" : "Question text"}
            <input
              value={item.question}
              onChange={(event) => update(index, { question: event.target.value })}
              maxLength={500}
            />
          </label>

          <label>
            {ar ? "نوع الإجابة" : "Answer type"}
            <select
              value={item.type}
              onChange={(event) =>
                update(index, { type: event.target.value === "choice" ? "choice" : "text" })
              }
            >
              <option value="text">{ar ? "إجابة نصية" : "Text answer"}</option>
              <option value="choice">{ar ? "اختيار من متعدد" : "Multiple choice"}</option>
            </select>
          </label>

          {item.type === "choice" && (
            <label>
              {ar ? "الخيارات (مفصولة بفاصلة)" : "Options (comma separated)"}
              <input
                value={item.options}
                onChange={(event) => update(index, { options: event.target.value })}
              />
            </label>
          )}

          <label>
            {ar ? "الإجابة الصحيحة" : "Correct answer"}
            <input
              value={item.correct_answer}
              onChange={(event) => update(index, { correct_answer: event.target.value })}
            />
          </label>

          <button type="button" className="quiz-builder-remove" onClick={() => remove(index)}>
            {ar ? "حذف السؤال" : "Remove question"}
          </button>
        </fieldset>
      ))}

      <button type="button" className="quiz-builder-add" onClick={add}>
        {ar ? "إضافة سؤال" : "Add question"}
      </button>

      <p className="creator-muted">
        {ar
          ? "تُحفظ الإجابات الصحيحة بشكل خاص ولا تظهر للزوار أبداً."
          : "Correct answers are stored privately and are never shown to visitors."}
      </p>
    </div>
  );
}
