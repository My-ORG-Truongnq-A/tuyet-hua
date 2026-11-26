import { test as base, expect } from "@playwright/test";

const SANITY_HOST = /(^|\.)(sanity\.io|apicdn\.sanity\.io)$/;

/**
 * Fixture chung: đánh trượt test nếu trang gọi Sanity (bản build local chạy seed)
 * hoặc nạp script từ origin khác (không widget / tracking ở bản xem thử).
 */
export const test = base.extend<{ guardNetwork: void }>({
  guardNetwork: [
    async ({ page, baseURL }, use) => {
      const offenders: string[] = [];
      const origin = new URL(baseURL ?? "http://127.0.0.1").origin;
      page.on("request", (req) => {
        const url = new URL(req.url());
        if (SANITY_HOST.test(url.hostname)) offenders.push(`sanity: ${req.url()}`);
        if (req.resourceType() === "script" && url.origin !== origin) offenders.push(`script ngoài: ${req.url()}`);
      });
      await use();
      expect(offenders, "Request bị cấm trên bản build local").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
