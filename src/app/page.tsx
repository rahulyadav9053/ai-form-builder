import { FormGenerator } from "@/components/form-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/20">
      <div className="space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome to Form Builder
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create, manage, and collect responses with ease. Build beautiful forms in minutes with our AI-powered form builder.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-3xl">
            <FormGenerator />
          </div>
        </div>
      </div>
    </div>
  );
}
