import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface SignInDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSignIn: () => Promise<void> | void;
    isSigningIn: boolean;
}

export function SignInDialog({
    open,
    onOpenChange,
    onSignIn,
    isSigningIn
}: SignInDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign in required</DialogTitle>
                    <DialogDescription>
                        You need to sign in before you can contribute to this funding flow.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSigningIn}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onSignIn} disabled={isSigningIn}>
                        {isSigningIn ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}