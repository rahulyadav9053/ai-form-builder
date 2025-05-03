"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, Settings, FileText, FormInput } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-gradient-to-r from-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <FormInput className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-medium text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Form Builder</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              size="sm"
              asChild
              className="font-medium hover:bg-primary/10 transition-colors"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={pathname === "/create" ? "default" : "ghost"}
              size="sm"
              asChild
              className="font-medium hover:bg-primary/10 transition-colors"
            >
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" />
                New Form
              </Link>
            </Button>
            <Button
              variant={pathname === "/forms" ? "default" : "ghost"}
              size="sm"
              asChild
              className="font-medium hover:bg-primary/10 transition-colors"
            >
              <Link href="/forms">
                <FileText className="mr-2 h-4 w-4" />
                My Forms
              </Link>
            </Button>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={pathname === "/settings" ? "default" : "ghost"}
            size="sm"
            asChild
            className="font-medium hover:bg-primary/10 transition-colors"
          >
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}