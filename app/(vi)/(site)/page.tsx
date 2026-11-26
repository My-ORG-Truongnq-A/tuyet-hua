import { HomeTemplate } from "@/templates/home/HomeTemplate";
import { homeMetadata } from "@/templates/home/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return homeMetadata("vi");
}

export default function HomePage() {
  return <HomeTemplate lang="vi" />;
}
