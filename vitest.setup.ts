import { afterEach, beforeEach, vi } from "vitest";

/**
 * Chặn mọi request mạng trong unit test: test chạy trên seed / fixture,
 * không bao giờ gọi Sanity (gói Free) hay dịch vụ ngoài.
 */
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: unknown) => {
      throw new Error(`Unit test không được gọi mạng: ${String(input)}`);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
