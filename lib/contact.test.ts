import { describe, expect, it } from "vitest";
import { formatPhone, telHref, zaloHref } from "./contact";

describe("lib/contact (T1.8)", () => {
  it("zaloHref → https://zalo.me/<số>", () => {
    expect(zaloHref("0359 361 359")).toBe("https://zalo.me/0359361359");
    expect(zaloHref("+84 359 361 359")).toBe("https://zalo.me/0359361359");
  });

  it("telHref → tel:<số>", () => {
    expect(telHref("0359 361 359")).toBe("tel:0359361359");
    expect(telHref("0359.361.359")).toBe("tel:0359361359");
  });

  it("thiếu / sai số → null (nút tự ẩn), không có số mặc định", () => {
    for (const v of [null, undefined, "", "abc", "123"]) {
      expect(zaloHref(v)).toBeNull();
      expect(telHref(v)).toBeNull();
    }
  });

  it("formatPhone nhóm 4-3-3", () => {
    expect(formatPhone("0359361359")).toBe("0359 361 359");
    expect(formatPhone("+84359361359")).toBe("0359 361 359");
    expect(formatPhone(null)).toBeNull();
  });
});
