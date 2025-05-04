"use client" // Add this directive because we are using hooks (useState, useEffect) for client-side rendering of charts

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, FileText, ListChecks, Users, ArrowLeft, BarChart3, Eye, Edit, Clock, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { formatDuration } from '@/lib/utils'; // Import the new utility function
import { Footer } from '@/components/footer';
import ProtectedRoute from '@/components/protected-route';

// Define chart config
const chartConfig = {
  responses: {
    label: "Responses",
    color: "hsl(var(--primary))", // Use primary color from theme
  },
} satisfies ChartConfig;

interface ResponsePerForm {
  formId: string;
  title: string;
  createdAt: string | null;
  responseCount: number;
  averageDurationSeconds: number | null;
}

interface DashboardStats {
  totalForms: number;
  totalResponses: number;
  responsesPerForm: ResponsePerForm[];
  overallAvgDurationSeconds: number | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalResponses: 0,
    responsesPerForm: [],
    overallAvgDurationSeconds: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/api/dashboard`);
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setStats(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Memoize chart data
  const chartData = useMemo(() => {
    return stats.responsesPerForm
      .sort((a, b) => b.responseCount - a.responseCount)
      .slice(0, 10)
      .map(form => ({
        formIdShort: form.formId.slice(0, 6) + '...',
        fullFormId: form.formId,
        responses: form.responseCount,
        createdAt: form.createdAt ? format(new Date(form.createdAt), 'MMM d, yyyy') : 'Unknown',
        avgDurationSeconds: form.averageDurationSeconds,
      }));
  }, [stats.responsesPerForm]);

  const overallAvgDurationSeconds = stats.overallAvgDurationSeconds;

  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
            <header className="mb-8 flex justify-between items-center">
                <Skeleton className="h-9 w-48" /> {/* Title Skeleton */}
                <Skeleton className="h-9 w-36" /> {/* Button Skeleton */}
            </header>
            {/* Key Metrics Skeleton - Updated for 4 cards */}
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">

                <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-8 w-16 mb-1" />
                         <Skeleton className="h-4 w-24" />
                    </CardContent>
                </Card>

                 <Card className="shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-5 rounded-full" />
                      </CardHeader>
                      <CardContent>
                           <Skeleton className="h-8 w-16 mb-1" />
                           <Skeleton className="h-4 w-24" />
                      </CardContent>
                  </Card>

                 <Card className="shadow-md">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <Skeleton className="h-5 w-36" />
                         <Skeleton className="h-5 w-5 rounded-full" />
                     </CardHeader>
                     <CardContent>
                          <Skeleton className="h-8 w-16 mb-1" />
                          <Skeleton className="h-4 w-28" />
                     </CardContent>
                 </Card>

                  <Card className="shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-5 rounded-full" />
                      </CardHeader>
                      <CardContent>
                           <Skeleton className="h-8 w-20 mb-1" />
                           <Skeleton className="h-4 w-36" />
                      </CardContent>
                  </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-1 mb-10">
                 <Card className="shadow-lg border border-border/50 h-[350px] flex flex-col">
                      <CardHeader className="border-b border-border/50">
                           <Skeleton className="h-6 w-48" />
                           <Skeleton className="h-4 w-64 mt-1" />
                      </CardHeader>
                      <CardContent className="flex-grow p-4 flex items-center justify-center">
                           <Skeleton className="h-full w-full" />
                      </CardContent>
                 </Card>

            </section>

             <section className="flex-grow">
                 <Card className="shadow-lg border border-border/50 h-full flex flex-col">
                     <CardHeader className="border-b border-border/50">
                         <Skeleton className="h-6 w-56" />
                         <Skeleton className="h-4 w-72 mt-1" />
                     </CardHeader>
                      <CardContent className="p-0 flex-grow">
                           <div className="overflow-x-auto">
                               <Table>
                                   <TableHeader>
                                       <TableRow className="bg-muted/50 hover:bg-muted/50">
                                           <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                           <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                           <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                                           <TableHead className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableHead>
                                           <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                                       </TableRow>
                                   </TableHeader>
                                   <TableBody>
                                       {[...Array(5)].map((_, i) => (
                                           <TableRow key={i} className="hover:bg-muted/30">
                                               <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                               <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                               <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                                               <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                                               <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                           </TableRow>
                                       ))}
                                   </TableBody>
                               </Table>
                           </div>
                      </CardContent>
                 </Card>
             </section>
             <footer className="text-center mt-12 py-4 text-sm text-muted-foreground border-t border-border/50">
                 <Skeleton className="h-4 w-32 mx-auto" />
             </footer>
        </div>
    );
  }


  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex items-center justify-center bg-secondary">
        <Card className="w-full max-w-md shadow-lg border-destructive bg-card">
          <CardHeader className="bg-destructive text-destructive-foreground rounded-t-lg p-4 flex flex-row items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle className="text-xl">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <CardDescription className="text-destructive text-center">
              {error}
            </CardDescription>
             <div className="flex justify-center">
                 <Button variant="outline" asChild>
                     <Link href="/">
                       <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                     </Link>
                 </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats.responsesPerForm.length) {
     return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen flex items-center justify-center">
           <p>No data available.</p>
            <Button variant="outline" asChild className="ml-4">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Link>
            </Button>
        </div>
     );
   }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">

         <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
           <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-border/50">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Total Forms Created</CardTitle>
               <FileText className="h-5 w-5 text-primary" />
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold text-foreground">{stats.totalForms}</div>
             </CardContent>
           </Card>
           <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-border/50">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses Received</CardTitle>
               <ListChecks className="h-5 w-5 text-primary" />
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold text-foreground">{stats.totalResponses}</div>
               <p className="text-xs text-muted-foreground">
                 Across all forms
               </p>
             </CardContent>
           </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-border/50">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Responses / Form</CardTitle>
                <Users className="h-5 w-5 text-primary" />
             </CardHeader>
             <CardContent>
                <div className="text-3xl font-bold text-foreground">
                   {stats.totalForms > 0 ? (stats.totalResponses / stats.totalForms).toFixed(1) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                    Average submissions per form
                </p>
             </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Submission Time</CardTitle>
                 <Clock className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                 <div className="text-3xl font-bold text-foreground">
                    {overallAvgDurationSeconds !== null ? formatDuration(overallAvgDurationSeconds) : 'N/A'}
                 </div>
                 <p className="text-xs text-muted-foreground">
                     Average time taken per submission
                 </p>
              </CardContent>
             </Card>
         </section>

         <section className="grid gap-6 lg:grid-cols-1 mb-10">
            <Card className="shadow-lg border border-border/50">
               <CardHeader className="border-b border-border/50">
                   <CardTitle className="flex items-center gap-2">
                       <BarChart3 className="h-5 w-5 text-primary" />
                       Form Submissions Overview
                   </CardTitle>
                   <CardDescription>
                       Number of responses for the top {chartData.length} most active forms.
                   </CardDescription>
               </CardHeader>
               <CardContent className="pt-6 pl-2 pr-6">
                   {chartData.length > 0 ? (
                       <ChartContainer config={chartConfig} className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}> {/* Adjusted margins */}
                               <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="formIdShort"
                                  tickLine={false}
                                  tickMargin={10}
                                  axisLine={false}
                                  tickFormatter={(value) => value}
                                 />
                                <YAxis
                                     tickLine={false}
                                     axisLine={false}
                                     tickMargin={10}
                                     allowDecimals={false}
                                 />
                                <ChartTooltip
                                  cursor={false}
                                  content={
                                     <ChartTooltipContent
                                          indicator="dot"
                                          labelKey="fullFormId"
                                          formatter={(value, name, props) => (
                                              <div className="flex flex-col gap-0.5 p-1">
                                                   <span className="font-semibold">{props.payload.fullFormId}</span>
                                                   <span className="text-muted-foreground text-xs">
                                                      Created: {props.payload.createdAt || 'N/A'}
                                                   </span>
                                                    {name === 'responses' && (
                                                      <span className="font-bold text-primary">{value} Responses</span>
                                                    )}
                                                    {props.payload.avgDurationSeconds !== null && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Avg. Time: {formatDuration(props.payload.avgDurationSeconds)}
                                                        </span>
                                                    )}
                                              </div>
                                          )}
                                      />
                                  }
                                />
                               <Bar dataKey="responses" fill="var(--color-responses)" radius={4} />
                           </BarChart>
                           </ResponsiveContainer>
                       </ChartContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                           No submission data available for charting.
                        </div>
                    )}
               </CardContent>
            </Card>
         </section>


        {/* Responses per Form Table */}
        <section className="flex-grow">
          <Card className="shadow-lg border border-border/50 h-full flex flex-col">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Form Details & Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className={`p-0 flex-grow ${stats.responsesPerForm.length === 0 ? 'flex items-center justify-center' : ''}`}>
              {stats.responsesPerForm.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[30%]">Form Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-center">Responses</TableHead>
                        <TableHead className="text-center">Avg. Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.responsesPerForm.map((form) => (
                        <TableRow
                          key={form.formId}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <Link
                                href={`/${form.formId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-foreground/90 group-hover:text-primary transition-colors"
                              >
                                {form.title}
                              </Link>

                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {form.createdAt ? format(new Date(form.createdAt), 'MMM d, yyyy') : 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <span className="text-lg font-semibold text-primary">
                                  {form.responseCount}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium">
                                  {form.averageDurationSeconds !== null
                                    ? formatDuration(form.averageDurationSeconds)
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                disabled={form.responseCount === 0}
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                title="View Live Form"
                              >
                                <Link href={`/forms/${form.formId}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-8 w-8 text-accent hover:bg-accent/10"
                                title="Edit Form"
                              >
                                <Link href={`/builder/${form.formId}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-8 w-8 text-accent hover:bg-accent/10"
                                title="View Analysis"
                              >
                                <Link href={`/analysis/${form.formId}`}>
                                  <LayoutDashboard className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-10">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No forms have been created yet.
                  </p>
                  <Button size="sm" className="mt-4" asChild>
                    <Link href="/">Generate your first form</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

       <Footer />
      </div>
    </ProtectedRoute>
  );
}
