import { Badge } from "@/components/ui/badge";

interface DistanceFilterProps {
  distances: number[];
  activeDistance: number;
  onDistanceChange: (distance: number) => void;
}

export function DistanceFilter({
  distances,
  activeDistance,
  onDistanceChange,
}: DistanceFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground shrink-0">Distance:</span>
      <div className="flex gap-1.5">
        {distances.map((distance) => (
          <button
            key={distance}
            onClick={() => onDistanceChange(distance)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeDistance === distance
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {distance} km
          </button>
        ))}
      </div>
    </div>
  );
}
