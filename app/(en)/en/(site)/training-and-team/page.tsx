import { TeamTemplate } from "@/templates/team/TeamTemplate";
import { teamMetadata } from "@/templates/team/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return teamMetadata("en");
}

export default function Page() {
  return <TeamTemplate lang="en" />;
}
