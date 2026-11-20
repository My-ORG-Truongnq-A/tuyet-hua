import { ProjectDetailTemplate } from "@/templates/projects/ProjectDetailTemplate";
import { projectMetadata, projectStaticParams } from "@/templates/projects/project.data";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
/** Slug ngoài danh sách build → không khớp route → global-not-found trả 404 kèm HTML đầy đủ (KT-06). Thêm dự án / bài trong CMS cần build lại (deploy hook sau G5). */
export const dynamicParams = false;

export function generateStaticParams() {
  return projectStaticParams("vi");
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return projectMetadata("vi", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetailTemplate lang="vi" slug={slug} />;
}
