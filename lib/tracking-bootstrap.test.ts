import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { trackingBootstrap } from "./tracking-bootstrap";

type Listener = () => void;

/** Cửa sổ giả đủ cho đoạn bootstrap: dataLayer, listener, setTimeout, document.head. */
function run(code: string, search = "") {
  const listeners = new Map<string, Listener[]>();
  const timers: Listener[] = [];
  const scripts: Array<{ src?: string; async?: boolean }> = [];
  const window: Record<string, unknown> = {
    location: { search },
    addEventListener: (type: string, fn: Listener) => listeners.set(type, [...(listeners.get(type) ?? []), fn]),
    removeEventListener: (type: string, fn: Listener) => listeners.set(type, (listeners.get(type) ?? []).filter((f) => f !== fn)),
    setTimeout: (fn: Listener) => timers.push(fn),
    clearTimeout: () => timers.splice(0),
  };
  const document = {
    createElement: () => {
      const s: { src?: string; async?: boolean } = {};
      return s;
    },
    head: { appendChild: (s: { src?: string }) => scripts.push(s) },
  };
  const ctx = vm.createContext({ window, document, setTimeout: window.setTimeout, clearTimeout: window.clearTimeout, Date });
  vm.runInContext(code, ctx);
  const fire = (type: string) => [...(listeners.get(type) ?? [])].forEach((fn) => fn());
  return { window, scripts, timers, fire, listeners, ctx };
}

const kindOf = (x: unknown) => Object.prototype.toString.call(x);

describe("trackingBootstrap — GTM-only (TR-01, HN-05)", () => {
  const code = trackingBootstrap({ kind: "gtm", id: "GTM-ABC1234" });

  it("dựng hàng đợi ngay: consent mặc định (quảng cáo denied) + gtm.start; CHƯA nạp thư viện", () => {
    const { window, scripts } = run(code);
    const dl = window.dataLayer as unknown[];
    expect(kindOf(dl[0])).toBe("[object Arguments]");
    expect(Array.from(dl[0] as ArrayLike<unknown>)).toEqual([
      "consent",
      "default",
      { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" },
    ]);
    expect(dl.some((e) => typeof e === "object" && e !== null && (e as Record<string, unknown>).event === "gtm.js")).toBe(true);
    expect(scripts).toHaveLength(0);
  });

  it("tương tác đầu → nạp gtm.js đúng ID đúng một lần", () => {
    const { scripts, fire } = run(code);
    fire("pointerdown");
    fire("scroll");
    fire("keydown");
    expect(scripts).toEqual([{ async: true, src: "https://www.googletagmanager.com/gtm.js?id=GTM-ABC1234" }]);
  });

  it("không tương tác → nạp sau hẹn giờ idle", () => {
    const { scripts, timers } = run(code);
    expect(timers).toHaveLength(1);
    timers[0]?.();
    expect(scripts).toHaveLength(1);
  });

  it("URL có click ID quảng cáo → nạp ngay", () => {
    expect(run(code, "?gclid=abc").scripts).toHaveLength(1);
    expect(run(code, "?a=1&fbclid=x").scripts).toHaveLength(1);
  });

  it("chạy lại đoạn mã (remount) không nạp / không khởi tạo lần hai", () => {
    const { ctx, scripts, window } = run(code, "?gclid=1");
    const before = (window.dataLayer as unknown[]).length;
    vm.runInContext(code, ctx);
    expect(scripts).toHaveLength(1);
    expect((window.dataLayer as unknown[]).length).toBe(before);
  });
});

describe("trackingBootstrap — GA4 gtag trực tiếp", () => {
  it("gtag js + config đúng ID; nạp gtag/js khi tương tác", () => {
    const { window, scripts, fire } = run(trackingBootstrap({ kind: "ga4", id: "G-ABCDE12345" }));
    const cmds = (window.dataLayer as unknown[]).map((e) => Array.from(e as ArrayLike<unknown>));
    expect(cmds.map((c) => c[0])).toEqual(["consent", "js", "config"]);
    expect(cmds[2]?.[1]).toBe("G-ABCDE12345");
    expect(typeof window.gtag).toBe("function");
    fire("touchstart");
    expect(scripts[0]?.src).toBe("https://www.googletagmanager.com/gtag/js?id=G-ABCDE12345");
  });
});

describe("trackingBootstrap — chặn ID lạ", () => {
  it("ID không hợp lệ → ném lỗi, không sinh mã", () => {
    expect(() => trackingBootstrap({ kind: "gtm", id: "GTM-1');alert(1)//" })).toThrow();
  });
});
