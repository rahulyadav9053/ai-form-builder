import { FormGenerator } from '@/components/form-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GeneratePage() {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="mb-8 text-center">
         <h1 className="text-4xl font-bold text-primary">FormForge AI</h1>
         <p className="text-muted-foreground mt-2">
            Generate dynamic forms instantly using AI prompts.
         </p>
      </header>
      <main className="flex-grow">
          <FormGenerator />
      </main>
       <footer className="text-center mt-12 py-4 text-sm text-muted-foreground">
          Powered by Firebase Studio & Genkit
       </footer>
    </div>
  );
}
