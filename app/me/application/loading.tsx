import { PageLoadingOverlay } from '@/components/page-loading-overlay';

export default function ApplicationLoading() {
  return (
    <div className="min-h-screen bg-[#f7faff] pt-28 pb-16">
      <PageLoadingOverlay label="Loading application…" />
    </div>
  );
}
