import { describe, expect, it } from "vitest";
import {
  CASE_STATUS_LABELS,
  DISCIPLINE_LABELS,
  REPORT_CATEGORY_LABELS,
  REPORT_TARGET_LABELS,
  RIGHTS_DECLARATION_LABELS,
  RIGHTS_REVIEW_STATUS_LABELS,
  TIER_LABELS,
  TIER_REQUEST_STATUS_LABELS,
  WORK_KIND_LABELS,
  WORK_VISIBILITY_LABELS,
  labelFor,
  type LabelMap,
} from "./labels";

const maps: Array<[string, LabelMap]> = [
  ["work visibility", WORK_VISIBILITY_LABELS],
  ["work kind", WORK_KIND_LABELS],
  ["rights declaration", RIGHTS_DECLARATION_LABELS],
  ["rights review status", RIGHTS_REVIEW_STATUS_LABELS],
  ["account tier", TIER_LABELS],
  ["tier request status", TIER_REQUEST_STATUS_LABELS],
  ["report target", REPORT_TARGET_LABELS],
  ["report category", REPORT_CATEGORY_LABELS],
  ["case status", CASE_STATUS_LABELS],
  ["discipline", DISCIPLINE_LABELS],
];

describe("bilingual labels", () => {
  it.each(maps)("every %s entry has both languages", (_name, map) => {
    for (const [key, label] of Object.entries(map)) {
      expect(label.ar.trim(), `${key} ar`).not.toBe("");
      expect(label.en.trim(), `${key} en`).not.toBe("");
    }
  });

  it("covers every work kind in the database taxonomy", () => {
    expect(Object.keys(WORK_KIND_LABELS).sort()).toEqual(
      [
        "short",
        "video",
        "podcast",
        "documentary",
        "short_film",
        "feature_film",
        "series",
        "photography",
        "visual_art",
        "music",
        "writing",
        "book",
        "research",
        "lecture",
        "conversation",
        "archive",
        "other",
      ].sort(),
    );
  });

  it("covers every report target accepted by the safety_reports constraint", () => {
    expect(Object.keys(REPORT_TARGET_LABELS).sort()).toEqual(
      ["account", "creator_identity", "work", "comment", "community", "message", "live_session"].sort(),
    );
  });

  it("returns the matching language", () => {
    expect(labelFor(WORK_VISIBILITY_LABELS, "private", "ar")).toBe("خاص");
    expect(labelFor(WORK_VISIBILITY_LABELS, "private", "en")).toBe("Private");
  });

  it("falls back to a readable token instead of rendering blank", () => {
    expect(labelFor(WORK_VISIBILITY_LABELS, "brand_new_state", "en")).toBe("brand new state");
    expect(labelFor(WORK_VISIBILITY_LABELS, null, "ar")).toBe("");
  });
});
