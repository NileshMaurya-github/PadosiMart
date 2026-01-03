// Category-based placeholder images for products
import groceryImg from "@/assets/products/grocery.jpg";
import medicalImg from "@/assets/products/medical.jpg";
import electronicsImg from "@/assets/products/electronics.jpg";
import clothingImg from "@/assets/products/clothing.jpg";
import foodImg from "@/assets/products/food.jpg";
import servicesImg from "@/assets/products/services.jpg";
import otherImg from "@/assets/products/other.jpg";

// Map shop categories to product images
export const categoryImages: Record<string, string> = {
  grocery: groceryImg,
  medical: medicalImg,
  electronics: electronicsImg,
  clothing: clothingImg,
  food: foodImg,
  services: servicesImg,
  other: otherImg,
  // Also map product sub-categories
  grains: groceryImg,
  pulses: groceryImg,
  oils: groceryImg,
  flour: groceryImg,
  essentials: groceryImg,
  vegetables: groceryImg,
  dairy: groceryImg,
  "pain relief": medicalImg,
  vitamins: medicalImg,
  "first aid": medicalImg,
  devices: medicalImg,
  protection: medicalImg,
  hygiene: medicalImg,
  "cold & cough": medicalImg,
  audio: electronicsImg,
  accessories: electronicsImg,
  cables: electronicsImg,
  lighting: electronicsImg,
  peripherals: electronicsImg,
  cameras: electronicsImg,
  men: clothingImg,
  women: clothingImg,
  kids: clothingImg,
  sports: clothingImg,
  "south indian": foodImg,
  "north indian": foodImg,
  starters: foodImg,
  rice: foodImg,
  desserts: foodImg,
  beverages: foodImg,
  snacks: foodImg,
  chinese: foodImg,
  repair: servicesImg,
  salon: servicesImg,
  home: servicesImg,
  vehicle: servicesImg,
  "pet food": otherImg,
  "pet care": otherImg,
  toys: otherImg,
};

export function getProductImage(category?: string | null, shopCategory?: string): string {
  if (category) {
    const lowerCategory = category.toLowerCase();
    if (categoryImages[lowerCategory]) {
      return categoryImages[lowerCategory];
    }
  }
  
  if (shopCategory) {
    const lowerShopCategory = shopCategory.toLowerCase();
    if (categoryImages[lowerShopCategory]) {
      return categoryImages[lowerShopCategory];
    }
  }
  
  return otherImg;
}
