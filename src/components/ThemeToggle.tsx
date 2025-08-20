"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme, actualTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
          {actualTheme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-gray-100 dark:bg-gray-800" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>হালকা থিম</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-gray-100 dark:bg-gray-800" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>গাঢ় থিম</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-gray-100 dark:bg-gray-800" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>সিস্টেম থিম</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick theme toggle without dropdown
export function QuickThemeToggle() {
  const { setTheme, actualTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(actualTheme === "light" ? "dark" : "light")}
      className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={actualTheme === "light" ? "গাঢ় থিমে পরিবর্তন করুন" : "হালকা থিমে পরিবর্তন করুন"}
    >
      {actualTheme === "light" ? (
        <Moon className="h-4 w-4 transition-transform hover:scale-110" />
      ) : (
        <Sun className="h-4 w-4 transition-transform hover:scale-110" />
      )}
    </Button>
  );
}