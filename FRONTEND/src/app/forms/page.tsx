"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Trash2, Edit, ExternalLink, List } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormData {
  id: string;
  title: string;
  createdAt: Date;
  controlCount: number;
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const formsRef = collection(db, "formConfigs");
      const q = query(formsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const formsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().config.title || "Untitled Form",
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        controlCount: doc.data().config.elements?.length || 0,
      }));

      setForms(formsData);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast({
        title: "Error",
        description: "Failed to load forms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (formId: string) => {
    try {
      await deleteDoc(doc(db, "formConfigs", formId));
      setForms(forms.filter(form => form.id !== formId));
      toast({
        title: "Success",
        description: "Form deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {forms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No forms created yet</p>
          <Button asChild>
            <Link href="/builder/new">
              Create Your First Form
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card
              key={form.id}
              className="group relative overflow-hidden bg-gradient-to-br from-card to-card/95 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all">
                    {form.title}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/builder/${form.id}`)}
                      className="h-8 w-8 hover:bg-primary/10 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/${form.id}`)}
                      className="h-8 w-8 hover:bg-primary/10 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(form.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground/80">
                  <List className="h-4 w-4 text-primary/80" />
                  <span className="font-medium">{form.controlCount} {form.controlCount === 1 ? 'control' : 'controls'}</span>
                  <span className="mx-2 text-primary/40">•</span>
                  <span>Created {form.createdAt.toLocaleDateString()}</span>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}