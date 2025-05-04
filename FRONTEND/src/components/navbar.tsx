"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, FileText, FormInput, LogOut } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="border-b bg-gradient-to-r from-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
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
        <div className="flex items-center gap-4 h-8">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 h-8">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}`}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border object-cover"
                style={{ minWidth: 32, minHeight: 32 }}
              />
              <div className="flex flex-col justify-center min-w-0 h-8">
                <span className="font-medium text-sm text-primary-foreground/90 leading-none truncate">{user.displayName || 'No Name'}</span>
                <span className="text-xs text-muted-foreground leading-none truncate">{user.email}</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}