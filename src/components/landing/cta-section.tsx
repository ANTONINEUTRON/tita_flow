import Link from "next/link";
import GetStartedButton from "../buttons/get-started-button";

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Start?</h2>
            <p className="mx-auto max-w-[700px] md:text-xl mt-4">
              Join the future of funding with Titaflow. Create your first funding flow today and experience the power of configurable, transparent funding.
            </p>
          </div>
          <div className="space-x-4 mt-8">
            <Link href="#">
              <GetStartedButton
                text="Get Started – Launch a Flow Today"
                variant='outline'
                className="text-primary font-medium mt-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}