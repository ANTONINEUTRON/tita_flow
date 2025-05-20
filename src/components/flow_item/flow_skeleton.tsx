import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FlowDetailSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto pb-8">
      <div className="flex justify-between items-center py-4 px-4">
        <Skeleton className="h-9 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Sidebar skeleton */}
        <div className="md:w-64 flex-shrink-0">
          <Card>
            <CardHeader className="pb-4">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="pb-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardContent>
              <Skeleton className="h-1 w-full my-3" />
              <div className="space-y-2 mt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-[300px] w-full mb-6" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  );
}