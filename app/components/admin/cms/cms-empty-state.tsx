import type { ReactNode } from "react";

export function CmsEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#d9d2c4] bg-[#fbfaf7] px-4 py-6 text-center">
      <p className="text-sm font-medium text-[#1f1f23]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[#5c574e]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
