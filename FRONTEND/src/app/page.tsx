'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FormGenerator } from "@/components/form-generator";
import { Card, CardContent} from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/constants';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`${ROUTES.LOGIN}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Form Builder</h1>
        </div>
        <Card className="shadow-lg border border-border/50">
          <CardContent>
            <FormGenerator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
