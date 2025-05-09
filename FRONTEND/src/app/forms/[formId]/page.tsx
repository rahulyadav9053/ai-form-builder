import { getFormConfigAction } from "@/app/actions";
import { FormRenderer } from "@/components/form-renderer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Footer } from "@/components/footer";
import ProtectedRoute from "@/components/protected-route";

interface FormPageProps {
  params: {
    formId: string;
  };
}

export default async function FormPage({ params }: FormPageProps) {
  const { formId } = params;
  const result = await getFormConfigAction(formId);

  if ("error" in result) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-destructive">
          <CardHeader className="bg-destructive text-destructive-foreground rounded-t-lg p-4 flex flex-row items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle className="text-xl">Error Loading Form</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CardDescription className="text-destructive text-center">
              {result.error} Please check the form ID or try again later.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
        <main className="w-full max-w-3xl">
          <FormRenderer formConfig={result.formConfig} formId={formId} />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

// Optional: Add metadata generation
export async function generateMetadata({ params }: FormPageProps) {
  return {
    title: `Form Submission ${params.formId}`,
    description: `Fill out the form with ID ${params.formId}.`,
  };
}
