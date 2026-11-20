import { AboutTemplate } from "@/templates/about/AboutTemplate";
import { aboutMetadata } from "@/templates/about/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return aboutMetadata("vi");
}

export default function Page() {
  return <AboutTemplate lang="vi" />;
}
