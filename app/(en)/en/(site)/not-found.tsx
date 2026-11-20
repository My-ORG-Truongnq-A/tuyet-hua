import { NotFoundTemplate } from "@/templates/not-found/NotFoundTemplate";
import { notFoundMetadata } from "@/templates/not-found/metadata";

export const metadata = notFoundMetadata("en");

export default function NotFoundEn() {
  return <NotFoundTemplate lang="en" />;
}
