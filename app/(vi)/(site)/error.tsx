"use client";

import { ErrorView } from "@/templates/error/ErrorView";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView lang="vi" error={error} reset={reset} />;
}
