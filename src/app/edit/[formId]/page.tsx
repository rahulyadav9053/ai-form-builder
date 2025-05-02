
import { getFormConfigAction } from '@/app/actions';
import { FormEditor } from '@/components/form-editor'; // New component for editing
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';

interface FormEditPageProps {
  params: {
    formId: string;
  };
}

// This page is now responsible for fetching the initial config and passing it to the editor
export default async function FormEditPage({ params }: FormEditPageProps) {
  const { formId } = params;
  const result = await getFormConfigAction(formId);

  if ('error' in result) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center bg-secondary/30">
         <Card className="w-full max-w-lg shadow-lg border-destructive">
            <CardHeader className="bg-destructive text-destructive-foreground rounded-t-lg p-4 flex flex-row items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                <CardTitle className="text-xl">Error Loading Form Editor</CardTitle>
            </CardHeader>
           <CardContent className="p-6 space-y-4">
             <CardDescription className="text-destructive text-center">
                Could not load form configuration: {result.error}
             </CardDescription>
             <div className="flex justify-center">
                 <Button variant="outline" asChild>
                     <Link href="/">
                       <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Generator
                     </Link>
                 </Button>
             </div>
           </CardContent>
         </Card>
      </div>
    );
  }

  // Pass the fetched config and ID to the FormEditor component
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
       <header className="mb-8 flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold text-primary text-center">AI-cellerators Form Editor</h1>
             {/* <p className="text-muted-foreground mt-1">
               Modify your form fields and save the configuration. Form ID: {formId}
             </p> */}
          </div>
          <div className="flex gap-2">
             {/* <Button variant="outline" size="sm" asChild>
                <Link href={`/${formId}`} target="_blank" rel="noopener noreferrer">
                   Preview Live Form
                </Link>
             </Button> */}
             <Button variant="outline" size="sm" asChild>
                <Link href="/">
                   <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generator
                </Link>
             </Button>
          </div>
       </header>
       <main className="flex-grow w-full max-w-4xl mx-auto">
          <FormEditor initialConfig={result.formConfig} formId={formId} />
       </main>
       <Footer />
    </div>
  );
}

// Optional: Add metadata generation
export async function generateMetadata({ params }: FormEditPageProps) {
  return {
    title: `Edit Form ${params.formId} | FormForge AI`,
    description: `Edit the form configuration for ID ${params.formId}.`,
  };
}

