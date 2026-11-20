import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { HomeTemplate } from "@/templates/home/HomeTemplate";
import { homeMetadata } from "@/templates/home/metadata";
import { notFoundMetadata } from "@/templates/not-found/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return env.languages.includes("en") ? homeMetadata("en") : notFoundMetadata("en");
}

export default function HomePageEn() {
  if (!env.languages.includes("en")) notFound();
  return <HomeTemplate lang="en" />;
}
