import { MapPin, Star, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShopCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  distance: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  deliveryTime?: string;
  onClick?: () => void;
}

export function ShopCard({
  name,
  category,
  imageUrl,
  distance,
  rating,
  reviewCount,
  isOpen,
  deliveryTime = "20-30 min",
  onClick,
}: ShopCardProps) {
  return (
    <Card
      variant="interactive"
      className="overflow-hidden group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <Badge
          variant={isOpen ? "open" : "closed"}
          className="absolute top-3 left-3"
        >
          {isOpen ? "Open" : "Closed"}
        </Badge>
        
        {/* Distance Badge */}
        <Badge variant="distance" className="absolute top-3 right-3">
          <MapPin className="w-3 h-3 mr-1" />
          {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)} km`}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
        </div>
        
        <Badge variant="category" className="mb-3">
          {category}
        </Badge>

        <div className="flex items-center justify-between text-sm">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Delivery Time */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{deliveryTime}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
