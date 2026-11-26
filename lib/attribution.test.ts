import { describe, expect, it } from "vitest";
import { FIRST_TOUCH_TTL_MS, parseFirstTouch, resolveFirstTouch, utmOnly } from "./attribution";

const NOW = Date.UTC(2026, 10, 20);

describe("parseFirstTouch — UTM từ URL, không PII", () => {
  it("không có utm_* → null (truy cập trực tiếp không phải first-touch UTM)", () => {
    expect(parseFirstTouch({ search: "?trang=2&gclid=abc", pathname: "/bai-viet", referrer: "https://google.com/", now: NOW })).toBeNull();
  });

  it("lấy đủ 5 utm_*, trang đích (chỉ path) và host referrer", () => {
    const ft = parseFirstTouch({
      search: "?utm_source=Facebook&utm_medium=cpc&utm_campaign=ha-long-xanh&utm_term=can%20ho&utm_content=v1&x=1",
      pathname: "/du-an/ha-long-xanh",
      referrer: "https://l.facebook.com/l.php?u=secret",
      now: NOW,
    });
    expect(ft).toEqual({
      utm_source: "Facebook",
      utm_medium: "cpc",
      utm_campaign: "ha-long-xanh",
      utm_term: "can ho",
      utm_content: "v1",
      landing_page: "/du-an/ha-long-xanh",
      referrer_host: "l.facebook.com",
      ts: NOW,
    });
  });

  it("referrer trống / sai → không có referrer_host", () => {
    const ft = parseFirstTouch({ search: "?utm_source=zalo", pathname: "/", referrer: "", now: NOW });
    expect(ft).toEqual({ utm_source: "zalo", landing_page: "/", ts: NOW });
  });

  it("giá trị giống email / số điện thoại bị bỏ; giá trị dài bị cắt 100 ký tự", () => {
    const ft = parseFirstTouch({
      search: `?utm_source=a%40b.vn&utm_medium=0359%20361%20359&utm_campaign=${"x".repeat(150)}`,
      pathname: "/",
      referrer: "",
      now: NOW,
    });
    expect(ft?.utm_source).toBeUndefined();
    expect(ft?.utm_medium).toBeUndefined();
    expect(ft?.utm_campaign).toHaveLength(100);
  });

  it("chỉ có utm rác (toàn PII) → null", () => {
    expect(parseFirstTouch({ search: "?utm_source=a@b.vn", pathname: "/", referrer: "", now: NOW })).toBeNull();
  });
});

describe("resolveFirstTouch — first-touch: không ghi đè bản còn hạn", () => {
  const first = { utm_source: "facebook", landing_page: "/", ts: NOW - 1000 };
  const later = { utm_source: "google", landing_page: "/du-an", ts: NOW };

  it("chưa lưu + có UTM → lưu bản hiện tại", () => {
    expect(resolveFirstTouch(null, later, NOW)).toEqual({ record: later, write: true });
  });

  it("đã lưu còn hạn → giữ bản đầu, không ghi", () => {
    expect(resolveFirstTouch(JSON.stringify(first), later, NOW)).toEqual({ record: first, write: false });
    expect(resolveFirstTouch(JSON.stringify(first), null, NOW)).toEqual({ record: first, write: false });
  });

  it("bản lưu hết hạn (30 ngày) → thay bằng UTM mới; không có UTM mới → xoá", () => {
    const old = JSON.stringify({ ...first, ts: NOW - FIRST_TOUCH_TTL_MS - 1 });
    expect(resolveFirstTouch(old, later, NOW)).toEqual({ record: later, write: true });
    expect(resolveFirstTouch(old, null, NOW)).toEqual({ record: null, write: true });
  });

  it("bản lưu hỏng (JSON sai / thiếu ts) → coi như chưa có", () => {
    expect(resolveFirstTouch("{oops", later, NOW)).toEqual({ record: later, write: true });
    expect(resolveFirstTouch(JSON.stringify({ utm_source: "x" }), null, NOW)).toEqual({ record: null, write: true });
  });

  it("chưa lưu, không UTM → không làm gì", () => {
    expect(resolveFirstTouch(null, null, NOW)).toEqual({ record: null, write: false });
  });
});

describe("utmOnly", () => {
  it("chỉ giữ utm_* (bỏ landing_page, referrer_host, ts)", () => {
    expect(utmOnly({ utm_source: "a", utm_campaign: "b", landing_page: "/", referrer_host: "x", ts: 1 })).toEqual({ utm_source: "a", utm_campaign: "b" });
    expect(utmOnly(null)).toEqual({});
  });
});
