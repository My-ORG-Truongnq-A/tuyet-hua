/**
 * Đăng ký patch theo vòng feedback. Mỗi vòng một tệp `scripts/sanity/patch-<yyyy-mm-dd>-<round>.ts`
 * export `default` kiểu PatchModule (migrate-core.ts), rồi thêm vào mảng dưới đây.
 * `sanity:migrate --apply` gọi tới các patch này (khoá _rev, backup trước khi ghi); cũng sửa seed tương ứng + test.
 * Hiện chưa có vòng feedback nào.
 */
import type { PatchModule } from "../migrate-core";

export const patches: PatchModule[] = [];
