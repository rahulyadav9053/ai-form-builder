import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">FormForge AI</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Welcome to FormForge AI! Generate dynamic forms instantly using AI prompts. Click the button below to start creating your form.
        </p>
      </header>
      <main>
        <Link href="/generate" passHref>
           <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Generating Form
           </Button>
        </Link>
      </main>
       <footer className="text-center mt-12 py-4 text-sm text-muted-foreground absolute bottom-0">
          Powered by Firebase Studio & Genkit
       </footer>
    </div>
  );
}
