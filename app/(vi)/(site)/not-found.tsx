import { NotFoundTemplate } from "@/templates/not-found/NotFoundTemplate";
import { notFoundMetadata } from "@/templates/not-found/metadata";

export const metadata = notFoundMetadata("vi");

export default function NotFound() {
  return <NotFoundTemplate lang="vi" />;
}
