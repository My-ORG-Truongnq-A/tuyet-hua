import { AboutTemplate } from "@/templates/about/AboutTemplate";
import { aboutMetadata } from "@/templates/about/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return aboutMetadata("en");
}

export default function Page() {
  return <AboutTemplate lang="en" />;
}
