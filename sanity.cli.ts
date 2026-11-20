import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

/** CLI Sanity (schema validate). Không có lệnh nào ở đây gọi API khi chạy kiểm offline. */
export default defineCliConfig({
  api: { projectId, dataset },
});
