import Link from "next/link";
import { useCases } from "@/lib/data/landing-data";

export function UseCasesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Use Cases</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Discover how Tita can transform your funding experience.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {useCases.map((useCase, index) => (
            <div key={index} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <div className="p-6 bg-white dark:bg-gray-800 h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{useCase.description}</p>
                </div>
                <div className="mt-4">
                  <Link href={`/use-cases`} className="text-primary hover:underline">
                    Learn more →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}