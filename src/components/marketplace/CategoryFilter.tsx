import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <Button
        variant={activeCategory === "all" ? "default" : "secondary"}
        size="sm"
        onClick={() => onCategoryChange("all")}
        className="shrink-0"
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "secondary"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className="shrink-0 capitalize"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
