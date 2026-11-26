import { LegalTemplate } from "@/templates/legal/LegalTemplate";
import { privacyMetadata } from "@/templates/legal/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return privacyMetadata("vi");
}

export default function Page() {
  return <LegalTemplate lang="vi" />;
}
