"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroGetStartedButton from "../buttons/get-started-button";
import Image from "next/image";
import { SocialLinks } from "./footer";
import { formatCurrency } from "@/lib/utils"; // Create this utility if not existing
import { AppConstants } from "@/lib/app_constants";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  const [stats, setStats] = useState({
    amountRaised: 1100,
    flowsCreated: 24
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
      <div className="container z-40 mx-auto flex justify-between items-center py-4 px-4">
        <Link href="/" className="flex items-center justify-start">
          <Image
            src={"/logo.png"}
            alt="Titaflow Logo"
            width={56}
            height={56} />
          {/* <span className="font-bold text-2xl">{AppConstants.APP_NAME}</span> */}
        </Link>
        <SocialLinks />
      </div>
      <section className="py-12 h-[100vh] md:py-24 lg:py-28 relative overflow-hidden">
        <div className="container z-40 mx-auto relative">
          {/* Hero content with parallax */}
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              transition: "transform 0.1s ease-out"
            }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Titaflow
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Configurable fundraising for any project or cause with transparency and control
            </p>
            <div className="space-x-4">
              <HeroGetStartedButton />
              <Link href="/faq" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Learn More
              </Link>
            </div>

            {/* Stats Section - now inside the parallax container */}
            <div className="grid grid-cols-2 gap-14 md:gap-24 my-12 mt-24 md:mt-24">
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-5xl font-bold tracking-tight text-primary">
                  ${(stats.amountRaised / 1000).toFixed(1)}K+
                </span>
                <span className="text-sm md:text-lg text-muted-foreground mt-2">
                  Total Funds Raised
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-5xl font-bold tracking-tight text-primary">
                  {stats.flowsCreated}+
                </span>
                <span className="text-sm md:text-lg text-muted-foreground mt-2">
                  Funding Flows Created
                </span>
              </div>
            </div>
          </div>
        </div>
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

        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]"
          style={{ transform: `translateY(${Math.min(scrollY * 0.5, 0)}px)` }}
        ></div>
      </section>
    </div >
  );
}