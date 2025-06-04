import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon, Sparkles } from "lucide-react";

interface AIAssistantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AIAssistantDialog({ open, onOpenChange }: AIAssistantDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-primary" />
                        Meet Leah, Your Project Guide
                    </DialogTitle>
                    <DialogDescription>
                        Your personal project assistant with answers to all your questions.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-4">
                        <p>
                            Leah AI is designed to help you understand this project better by:
                        </p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>Answering questions about project goals and milestones</li>
                            <li>Providing context on updates and progress</li>
                            <li>Explaining technical aspects in simple terms</li>
                            <li>Summarizing key information for quick understanding</li>
                        </ul>

                        <div className="bg-muted p-4 rounded-md flex items-start">
                            <div className="bg-primary/10 p-2 rounded-full mr-3">
                                <InfoIcon className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-sm">
                                <strong>Coming Soon:</strong> We're currently teaching Leah everything about this project. She'll be ready to assist you in the next update!
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        Got it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}