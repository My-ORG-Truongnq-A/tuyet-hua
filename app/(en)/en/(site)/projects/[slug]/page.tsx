import { ProjectDetailTemplate } from "@/templates/projects/ProjectDetailTemplate";
import { projectMetadata, projectStaticParams } from "@/templates/projects/project.data";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return projectStaticParams("en");
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return projectMetadata("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetailTemplate lang="en" slug={slug} />;
}
