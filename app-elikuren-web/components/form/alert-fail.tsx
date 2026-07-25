import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, InfoIcon } from "lucide-react";

export default function AlertFail({ description }: { description: string }) {
  return (
    <div className="grid w-full max-w-md items-start mt-1 gap-4">
      <Alert variant="form">
        <div className="flex items-center gap-2">
          <InfoIcon size={16} />
          <AlertDescription className="m-0 text-destructive">
            {description}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
