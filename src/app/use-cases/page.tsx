"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bell } from "lucide-react";
import { useCases } from "@/lib/data/landing_data";

export default function UseCasesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      {/* Header Section */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          TitaFlow Use Cases
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Explore the diverse ways TitaFlow can transform funding across different sectors with transparent, milestone-based approaches.
        </p>
      </div>

      {/* Use Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {useCases.map((useCase, index) => (
          <Card key={index} className="overflow-hidden flex flex-col h-full border border-border/40 transition-all hover:border-primary/20 hover:shadow-md">
            <div className="h-48 relative bg-muted">
              <Image 
                src={useCase.image} 
                alt={useCase.title}
                fill
                className="object-cover"
              />
              <Badge className="absolute top-3 right-3 bg-primary hover:bg-primary text-white">
                Coming Soon
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>{useCase.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-sm md:text-base">
                {useCase.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Notification Section */}
      <div className="bg-muted/50 rounded-lg p-6 md:p-8 max-w-3xl mx-auto text-center border border-border/60">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">Get Notified When Use Cases Launch</h2>
        <p className="text-muted-foreground mb-6">
          We're working hard to bring these use cases to life. Subscribe to be the first to know when they're available.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input placeholder="Enter your email" className="flex-grow" />
          <Button type="submit">
            <Bell className="mr-2 h-4 w-4" />
            Notify Me
          </Button>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center mt-12">
        <Link href="/" className="text-primary hover:underline inline-flex items-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}