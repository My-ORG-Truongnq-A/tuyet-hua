import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findBannedPhrases } from "./banned-phrases";

describe("cụm từ cấm (REQ-13)", () => {
  it("nhận diện không phân biệt hoa thường", () => {
    expect(findBannedPhrases("Chúng tôi CAM KẾT LỢI NHUẬN 20%")).toEqual(["cam kết lợi nhuận"]);
    expect(findBannedPhrases("Đồng hành bền lâu")).toEqual([]);
  });

  it("seed thật không chứa cụm cấm", () => {
    const seed = readFileSync(join(__dirname, "../seed/sanity/documents.json"), "utf8");
    expect(findBannedPhrases(seed)).toEqual([]);
  });
});
