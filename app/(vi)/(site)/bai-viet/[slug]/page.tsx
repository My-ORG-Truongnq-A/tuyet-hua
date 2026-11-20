import { ArticleDetailTemplate } from "@/templates/articles/ArticleDetailTemplate";
import { postMetadata, postStaticParams } from "@/templates/articles/articles.data";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return postStaticParams("vi");
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return postMetadata("vi", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ArticleDetailTemplate lang="vi" slug={slug} />;
}
