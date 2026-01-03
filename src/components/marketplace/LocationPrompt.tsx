import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LocationPromptProps {
  onEnableLocation: () => void;
  isLoading?: boolean;
  error?: string;
}

export function LocationPrompt({ onEnableLocation, isLoading, error }: LocationPromptProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-md w-full text-center p-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Enable Location
        </h2>
        
        <p className="text-muted-foreground mb-6">
          To show you nearby shops and local sellers, we need access to your location. 
          Your data stays private and is only used to find shops near you.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={onEnableLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Getting location...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 mr-2" />
              Allow Location Access
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          You can change this anytime in your browser settings
        </p>
      </Card>
    </div>
  );
}
