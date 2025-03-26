"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="w-full h-[100vh] py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 relative overflow-hidden">
      <div 
        className="container px-4 md:px-6 mx-auto relative z-10"
        style={{ 
          transform: `translateY(${scrollY * 0.4}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Launch a Flow<br/> Fund, Invest, and Transact Your Way
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                Tita lets you create fully customizable, flexible funding flows for grants, escrow payments, and investments—to your needs.
            </p>
          </div>
          <div className="space-x-4 mt-8">
            <Link href="/app/dashboard" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Get started
            </Link>
            <Link href="/learn-more" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Learn More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Parallax background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        ></div>
        <div 
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-primary-light rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
      </div>
      
      {/* Optional foreground elements that move faster than background (creates depth) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]"
        style={{ transform: `translateY(${Math.min(scrollY * 0.5, 0)}px)` }}
      ></div>
    </section>
  );
}