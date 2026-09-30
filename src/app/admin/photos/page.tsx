import { getAdminPhotos } from "@/app/admin/photos/actions";
import { PhotosPanel } from "@/app/admin/photos/panel";
import { features } from "@/lib/features";
import { getQueryClient } from "@/lib/get-query-client";
import { missingPhotoStorageEnv } from "@/lib/photo-storage";
import { queryKeys } from "@/lib/query-keys";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

export default async function AdminPhotosPage() {
  if (!features.photos) notFound();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.photos,
    queryFn: getAdminPhotos,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PhotosPanel missingEnv={missingPhotoStorageEnv()} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
