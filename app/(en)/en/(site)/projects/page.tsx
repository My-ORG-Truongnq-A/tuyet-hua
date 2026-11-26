import { ProjectListTemplate } from "@/templates/projects/ProjectListTemplate";
import { projectsMetadata } from "@/templates/projects/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return projectsMetadata("en");
}

export default function Page() {
  return <ProjectListTemplate lang="en" />;
}
