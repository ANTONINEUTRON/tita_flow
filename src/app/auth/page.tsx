"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppConstants } from "@/lib/app_constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle redirect or state update
    }, 2000);
  };
  
  const handleWalletConnect = async () => {
    setIsLoading(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      setIsLoading(false);
      // Handle wallet connection
    }, 1500);
  };

  return (
    <div className="container relative flex-col items-center justify-center min-h-screen grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left section - Illustration/explanation */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt={AppConstants.APP_NAME} 
              width={40} 
              height={40} 
              className="h-10 w-10" 
            />
            {AppConstants.APP_NAME}
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Tita completely transformed how we manage our grant program. The milestone-based funding has increased project completion rates by over 70%."
            </p>
            <footer className="text-sm">Sofia Chen, Head of Grants at Web3 Foundation</footer>
          </blockquote>
        </div>
      </div>
      
      {/* Right section - Auth forms */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to {AppConstants.APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email Authentication</CardTitle>
                  <CardDescription>
                    Sign in with your email address and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleEmailSignIn}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="hello@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <Input id="password" type="password" required />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-primary hover:underline">
                      Create one
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Connection</CardTitle>
                  <CardDescription>
                    Connect with your web3 wallet to sign in securely
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleWalletConnect}
                    disabled={isLoading}
                  >
                    {/* Phantom logo */}
                    <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="128" height="128" rx="64" fill="#AB9FF2"/>
                      <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8354 41.3461 14.4738 64.0368C14.0708 89.084 35.5834 110 60.8854 110H64.8624C87.2781 110 112.069 91.7091 113.51 69.7401C113.727 67.6013 112.359 64.9142 110.584 64.9142ZM39.7689 65.9311C39.7689 69.2689 37.1593 72.0631 33.9023 72.0631C30.6452 72.0631 28.0356 69.2689 28.0356 65.9311V58.6128C28.0356 55.275 30.6452 52.5645 33.9023 52.5645C37.1593 52.5645 39.7689 55.275 39.7689 58.6128V65.9311ZM60.9991 65.9311C60.9991 69.2689 58.3895 72.0631 55.1325 72.0631C51.8754 72.0631 49.2658 69.2689 49.2658 65.9311V58.6128C49.2658 55.275 51.9188 52.5645 55.1758 52.5645C58.4329 52.5645 61.0425 55.275 61.0425 58.6128V65.9311H60.9991Z" fill="white"/>
                    </svg>
                    {isLoading ? "Connecting..." : "Connect with Phantom"}
                  </Button>
                  
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    {/* Generic wallet icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 7H18V6C18 4.89543 17.1046 4 16 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7ZM5 6H16V7H5V6ZM19 18H5V9H19V18Z" fill="currentColor"/>
                      <path d="M16 14C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14Z" fill="currentColor"/>
                    </svg>
                    Connect Another Wallet
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <p className="text-xs text-muted-foreground text-center max-w-[90%] mx-auto">
                    By connecting your wallet, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}