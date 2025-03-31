import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DistributeDetailSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto pb-8 px-4">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center py-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flow title and status */}
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-5 w-full" />
          </div>

          {/* Tab navigation */}
          <div className="border-b">
            <div className="flex gap-4 pb-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-9 w-28" />
              ))}
            </div>
          </div>

          {/* Cover image */}
          <Skeleton className="w-full h-64 rounded-lg" />

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-8 rounded-full mb-2" />
                    <Skeleton className="h-7 w-24 mb-1" />
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>

              <Skeleton className="h-px w-full" />

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}