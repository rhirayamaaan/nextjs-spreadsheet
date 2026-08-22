import { Suspense } from "react";
import { PreviewContainerDynamic } from "@/features/preview/containers/dynamic";

export default function PreviewPage() {
  return (
    <Suspense fallback={<div>プレビュー画面を読み込んでいます...</div>}>
      <PreviewContainerDynamic />
    </Suspense>
  );
}
