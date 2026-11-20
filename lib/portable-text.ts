/** Portable Text (blockContent / blockContentLite) — tiện ích thuần cho JSON-LD, mô tả, kiểm khối trống. */
export type PortableBlock = {
  _type: string;
  _key?: string;
  style?: string;
  children?: { _type?: string; text?: string }[];
  [k: string]: unknown;
};

export type PortableValue = PortableBlock[] | null | undefined;

const blockText = (b: PortableBlock) => (b.children ?? []).map((c) => c.text ?? "").join("");

export function toPlainText(value: PortableValue): string {
  return (value ?? [])
    .filter((b) => b?._type === "block")
    .map(blockText)
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Có nội dung thật để render (đoạn có chữ, hoặc ảnh / bảng / nhúng). */
export function hasBlocks(value: PortableValue): value is PortableBlock[] {
  return (value ?? []).some((b) => (b?._type === "block" ? blockText(b).trim().length > 0 : Boolean(b?._type)));
}
