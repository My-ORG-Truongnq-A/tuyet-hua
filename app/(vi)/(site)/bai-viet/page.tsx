import { ArticleListTemplate } from "@/templates/articles/ArticleListTemplate";
import { articlesMetadata, type SearchParams } from "@/templates/articles/articles.data";

/** ?trang=N (T3.11) → trang render theo request; nội dung vẫn đọc qua cache tag của lớp dữ liệu. */
type Props = { searchParams: SearchParams };

export async function generateMetadata({ searchParams }: Props) {
  return articlesMetadata("vi", (await searchParams).trang);
}

export default async function Page({ searchParams }: Props) {
  return <ArticleListTemplate lang="vi" trang={(await searchParams).trang} />;
}
