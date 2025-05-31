import { howItWorks } from "@/lib/data/landing_data";

export function HowItWorksSection() {
  return (
    <section className="w-full py-12 md:py-20 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Follow these simple steps to get started with Tita.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {howItWorks.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center p-6">
              <div className="text-4xl font-bold text-primary/20 dark:text-primary/30 mb-4">{step.step}</div>
              <h3 className="text-xl font-bold mb-2 text-center">{step.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">{step.description}</p>
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 w-1/3 h-0.5 bg-gray-200 dark:bg-gray-800 transform translate-x-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}