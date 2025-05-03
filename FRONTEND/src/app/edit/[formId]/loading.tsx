
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
     <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
        <header className="mb-8 flex justify-between items-center">
           <div>
              <Skeleton className="h-8 w-48 mb-2" /> {/* Title Skeleton */}
              <Skeleton className="h-4 w-72" /> {/* Description Skeleton */}
           </div>
           <div className="flex gap-2">
              <Skeleton className="h-9 w-36" /> {/* Preview Button Skeleton */}
              <Skeleton className="h-9 w-40" /> {/* Back Button Skeleton */}
           </div>
        </header>
         <main className="flex-grow w-full max-w-4xl mx-auto">
            <Card className="shadow-lg border border-border/50 animate-pulse">
               <CardHeader>
                  <Skeleton className="h-7 w-56 mb-2" /> {/* Editor Title Skeleton */}
                   <Skeleton className="h-4 w-96" /> {/* Editor Description Skeleton */}
               </CardHeader>
                <CardContent className="space-y-4">
                    {/* Simulate a few loading form fields */}
                    {[...Array(3)].map((_, i) => (
                       <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-2 bg-card p-4 rounded-lg border shadow-sm">
                          <div className="space-y-2">
                             <Skeleton className="h-5 w-1/4" /> {/* Label Skeleton */}
                             <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
                              <Skeleton className="h-3 w-1/2" /> {/* Meta Skeleton */}
                          </div>
                          <Skeleton className="h-10 w-10" /> {/* Remove Button Skeleton */}
                       </div>
                     ))}
                </CardContent>
                <CardFooter className="flex justify-end space-x-3 border-t border-border/50 pt-6">
                     <Skeleton className="h-10 w-28" /> {/* Add Field Button Skeleton */}
                     <Skeleton className="h-10 w-32" /> {/* Save Button Skeleton */}
                </CardFooter>
            </Card>
         </main>
         <footer className="text-center mt-12 py-4 text-sm text-muted-foreground border-t border-border/30">
              <Skeleton className="h-4 w-40 mx-auto" /> {/* Footer Skeleton */}
         </footer>
     </div>
   )
}
