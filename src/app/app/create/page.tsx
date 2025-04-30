import RaiseFlowForm from "@/components/flows/raise-flow-form";


export default function CreateFlowPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create a New Flow</h1>
        <p className="text-muted-foreground">
          Set up a funding flow that matches your specific needs
        </p>
      </div>

      <RaiseFlowForm />
    </div>
  );
}