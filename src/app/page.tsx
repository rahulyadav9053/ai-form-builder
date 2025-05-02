import { FormGenerator } from '@/components/form-generator';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="mb-8 text-center"> {/* Removed relative positioning */}
         <h1 className="text-4xl font-bold text-primary">AI-cellerators</h1>
         <p className="text-muted-foreground mt-2">
            Generate or build dynamic forms instantly.
         </p>

      </header>
      <main className="flex-grow flex flex-col items-center w-full">
          <FormGenerator />
      </main>
      <Footer />
    </div>
  );
}
