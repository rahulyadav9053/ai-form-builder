import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormEditor } from "@/components/form-editor";
import { Footer } from "@/components/footer";
import { getFormConfigAction } from "@/app/actions";
import ProtectedRoute from "@/components/protected-route";

interface FormEditPageProps {
  params: {
    formId: string;
  };
}

export default async function FormEditPage({ params }: FormEditPageProps) {
  const { formId } = params;

  const result = await getFormConfigAction(formId);

  if ("error" in result) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center bg-secondary/30">
        <div className="w-full max-w-lg shadow-lg border-destructive">
          <div className="bg-destructive text-destructive-foreground rounded-t-lg p-4 flex flex-row items-center gap-2">
            <span className="text-xl">Error Loading Form Editor</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-destructive text-center">
              Could not load form configuration: {result.error}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Generator
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
        <main className="flex-grow w-full max-w-4xl mx-auto">
          <FormEditor
            initialConfig={result.formConfig}
            formId={formId}
            isNewForm={formId === "new" ? true : false}
          />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export async function generateMetadata({ params }: FormEditPageProps) {
  return {
    title: `Form Builder`,
    description: `Edit the form configuration for ID ${params.formId}.`,
  };
}
