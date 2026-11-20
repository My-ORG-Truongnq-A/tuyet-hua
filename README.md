# Hứa Thị Tuyết — website thương hiệu cá nhân

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Sanity (tuỳ chọn) · pnpm.

Chuẩn dựng site: [`docs/standards/`](docs/standards/README.md) — hồ sơ dự án ở [`docs/standards/00-du-an.md`](docs/standards/00-du-an.md).

## Chạy trên máy

```bash
pnpm install --frozen-lockfile
pnpm build && pnpm start     # bản build production local, nội dung từ seed, noindex
```

Biến môi trường: xem `.env.example` (không đặt gì → seed + noindex + chỉ tiếng Việt).

Kiểm trước khi commit (cũng là job `ci`):

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Nguồn nội dung (KT-01)

- `SANITY_SOURCE=seed` hoặc chưa có `NEXT_PUBLIC_SANITY_PROJECT_ID` → đọc `seed/sanity/documents.json` bằng `groq-js`.
- `SANITY_SOURCE=sanity` → đọc Sanity qua CDN, cùng truy vấn GROQ (`lib/content/`).
- Studio ở `/studio` chỉ chạy khi đã có `NEXT_PUBLIC_SANITY_PROJECT_ID`; chưa có thì trang báo “chưa bật CMS”.
