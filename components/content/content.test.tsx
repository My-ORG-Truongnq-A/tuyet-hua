import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PendingLabel } from "./PendingLabel";
import { RichText } from "./RichText";
import { Section } from "./Section";

const block = (text: string, style = "normal", extra: Record<string, unknown> = {}) => ({
  _type: "block",
  _key: Math.random().toString(36).slice(2),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: "s", text, marks: [] }],
  ...extra,
});

describe("Section (T3.7)", () => {
  it("empty → không render gì", () => {
    expect(renderToStaticMarkup(<Section name="story" heading="Về tôi" empty />)).toBe("");
  });

  it("có data-section và h2 gắn aria-labelledby", () => {
    const html = renderToStaticMarkup(
      <Section name="story" heading="Về tôi">
        <p>Nội dung</p>
      </Section>,
    );
    expect(html).toContain('data-section="story"');
    expect(html).toMatch(/<h2 id="story-title"/);
    expect(html).toContain('aria-labelledby="story-title"');
  });
});

describe("PendingLabel (REQ-21)", () => {
  it("chỉ hiện ở preview", () => {
    expect(renderToStaticMarkup(<PendingLabel mode="preview">Chờ xác nhận</PendingLabel>)).toContain("Chờ xác nhận");
    expect(renderToStaticMarkup(<PendingLabel mode="release">Chờ xác nhận</PendingLabel>)).toBe("");
  });
});

describe("RichText (T3.6)", () => {
  it("h1 trong nội dung hạ thành h2 — giữ một H1 / trang", () => {
    const html = renderToStaticMarkup(<RichText lang="vi" value={[block("Tiêu đề", "h1"), block("Đoạn.")]} />);
    expect(html).not.toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<p");
  });

  it("link ngoài có rel=noopener; link nội bộ tới singleton trang theo ngôn ngữ", () => {
    const value = [
      {
        ...block("x"),
        markDefs: [
          { _key: "a", _type: "link", href: "https://example.com" },
          { _key: "b", _type: "link", internal: { _ref: "contactPage-vi" } },
        ],
        children: [
          { _type: "span", _key: "1", text: "ngoài", marks: ["a"] },
          { _type: "span", _key: "2", text: "trong", marks: ["b"] },
        ],
      },
    ];
    const html = renderToStaticMarkup(<RichText lang="vi" value={value} />);
    expect(html).toMatch(/href="https:\/\/example.com"[^>]*rel="noopener noreferrer"/);
    expect(html).toContain('href="/lien-he"');
  });

  it("nội dung trống → không render", () => {
    expect(renderToStaticMarkup(<RichText lang="vi" value={[]} />)).toBe("");
    expect(renderToStaticMarkup(<RichText lang="vi" value={null} />)).toBe("");
  });
});
