import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const demoSellers = [
  { email: "freshmart@demo.com", password: "Demo@123", shopName: "Fresh Mart Koramangala", category: "grocery", address: "Koramangala 4th Block, Bangalore 560034", phone: "9876543210", lat: 12.9352, lng: 77.6245 },
  { email: "apollo@demo.com", password: "Demo@123", shopName: "Apollo Pharmacy HSR", category: "medical", address: "HSR Layout Sector 2, Bangalore 560102", phone: "9876543211", lat: 12.9116, lng: 77.6389 },
  { email: "techworld@demo.com", password: "Demo@123", shopName: "Tech World Indiranagar", category: "electronics", address: "Indiranagar 100 Feet Road, Bangalore 560038", phone: "9876543212", lat: 12.9784, lng: 77.6408 },
  { email: "fashionhub@demo.com", password: "Demo@123", shopName: "Fashion Hub Brigade", category: "clothing", address: "Brigade Road, Bangalore 560001", phone: "9876543213", lat: 12.9716, lng: 77.6070 },
  { email: "desidhaba@demo.com", password: "Demo@123", shopName: "Desi Dhaba BTM", category: "food", address: "BTM Layout 2nd Stage, Bangalore 560076", phone: "9876543214", lat: 12.9166, lng: 77.6101 },
  { email: "quickfix@demo.com", password: "Demo@123", shopName: "Quick Fix Electronics", category: "services", address: "Jayanagar 4th Block, Bangalore 560041", phone: "9876543215", lat: 12.9308, lng: 77.5838 },
  { email: "dailyneeds@demo.com", password: "Demo@123", shopName: "Daily Needs Whitefield", category: "grocery", address: "Whitefield Main Road, Bangalore 560066", phone: "9876543216", lat: 12.9698, lng: 77.7500 },
  { email: "medplus@demo.com", password: "Demo@123", shopName: "MedPlus Marathahalli", category: "medical", address: "Marathahalli Bridge, Bangalore 560037", phone: "9876543217", lat: 12.9591, lng: 77.6971 },
  { email: "gadgetzone@demo.com", password: "Demo@123", shopName: "Gadget Zone Electronic City", category: "electronics", address: "Electronic City Phase 1, Bangalore 560100", phone: "9876543218", lat: 12.8399, lng: 77.6770 },
  { email: "ethnicwear@demo.com", password: "Demo@123", shopName: "Ethnic Wear Malleshwaram", category: "clothing", address: "Malleshwaram 8th Cross, Bangalore 560003", phone: "9876543219", lat: 12.9969, lng: 77.5700 },
  { email: "southspice@demo.com", password: "Demo@123", shopName: "South Spice JP Nagar", category: "food", address: "JP Nagar 6th Phase, Bangalore 560078", phone: "9876543220", lat: 12.9077, lng: 77.5850 },
  { email: "petparadise@demo.com", password: "Demo@123", shopName: "Pet Paradise Bellandur", category: "other", address: "Bellandur Main Road, Bangalore 560103", phone: "9876543221", lat: 12.9256, lng: 77.6760 },
  { email: "organicfarm@demo.com", password: "Demo@123", shopName: "Organic Farm Store", category: "grocery", address: "Sarjapur Road, Bangalore 560035", phone: "9876543222", lat: 12.9108, lng: 77.6859 },
  { email: "stylesalon@demo.com", password: "Demo@123", shopName: "Style Salon Yelahanka", category: "services", address: "Yelahanka New Town, Bangalore 560064", phone: "9876543223", lat: 13.1005, lng: 77.5940 },
  { email: "pizzacorner@demo.com", password: "Demo@123", shopName: "Pizza Corner MG Road", category: "food", address: "MG Road, Bangalore 560001", phone: "9876543224", lat: 12.9757, lng: 77.6060 },
];

// Sample products by category
const productsByCategory: Record<string, Array<{ name: string; description: string; price: number; originalPrice?: number; stock: number; unit: string; category: string }>> = {
  grocery: [
    { name: "Basmati Rice", description: "Premium long grain basmati rice, 5kg pack", price: 450, originalPrice: 520, stock: 100, unit: "kg", category: "Grains" },
    { name: "Toor Dal", description: "High quality toor dal, cleaned and sorted", price: 180, stock: 80, unit: "kg", category: "Pulses" },
    { name: "Sunflower Oil", description: "Refined sunflower oil, 1 litre", price: 145, originalPrice: 165, stock: 50, unit: "litre", category: "Oils" },
    { name: "Aashirvaad Atta", description: "Whole wheat flour, 10kg bag", price: 520, stock: 60, unit: "kg", category: "Flour" },
    { name: "Sugar", description: "Refined white sugar, 5kg pack", price: 250, stock: 70, unit: "kg", category: "Essentials" },
    { name: "Fresh Tomatoes", description: "Farm fresh red tomatoes", price: 40, stock: 200, unit: "kg", category: "Vegetables" },
    { name: "Onions", description: "Red onions, medium size", price: 35, stock: 150, unit: "kg", category: "Vegetables" },
    { name: "Potatoes", description: "Fresh potatoes for cooking", price: 30, stock: 180, unit: "kg", category: "Vegetables" },
    { name: "Amul Butter", description: "Pasteurized butter, 500g", price: 280, stock: 40, unit: "piece", category: "Dairy" },
    { name: "Milk", description: "Fresh toned milk, 1 litre", price: 58, stock: 100, unit: "litre", category: "Dairy" },
  ],
  medical: [
    { name: "Dolo 650", description: "Paracetamol 650mg tablets, strip of 15", price: 35, stock: 200, unit: "strip", category: "Pain Relief" },
    { name: "Crocin Advance", description: "Fast acting pain relief tablets", price: 42, stock: 150, unit: "strip", category: "Pain Relief" },
    { name: "Vitamin D3 Supplements", description: "Calcium + Vitamin D3, 60 tablets", price: 320, stock: 80, unit: "bottle", category: "Vitamins" },
    { name: "Betadine Solution", description: "Antiseptic solution, 100ml", price: 115, stock: 60, unit: "bottle", category: "First Aid" },
    { name: "Band-Aid Strips", description: "Adhesive bandages, pack of 50", price: 85, stock: 100, unit: "pack", category: "First Aid" },
    { name: "ORS Sachets", description: "Oral rehydration salts, pack of 10", price: 45, stock: 120, unit: "pack", category: "Essentials" },
    { name: "Digital Thermometer", description: "Electronic digital thermometer", price: 199, stock: 40, unit: "piece", category: "Devices" },
    { name: "N95 Mask", description: "Protective face mask, pack of 5", price: 150, stock: 200, unit: "pack", category: "Protection" },
    { name: "Hand Sanitizer", description: "70% alcohol based sanitizer, 500ml", price: 120, originalPrice: 150, stock: 100, unit: "bottle", category: "Hygiene" },
    { name: "Vicks VapoRub", description: "Cold relief ointment, 50g", price: 145, stock: 75, unit: "jar", category: "Cold & Cough" },
  ],
  electronics: [
    { name: "Boat Earbuds", description: "True wireless earbuds with noise cancellation", price: 1999, originalPrice: 2999, stock: 30, unit: "piece", category: "Audio" },
    { name: "Mi Power Bank 20000mAh", description: "Fast charging power bank", price: 1599, stock: 25, unit: "piece", category: "Accessories" },
    { name: "USB-C Cable", description: "Fast charging Type-C cable, 1m", price: 299, stock: 100, unit: "piece", category: "Cables" },
    { name: "Phone Case", description: "Transparent silicone phone cover", price: 199, stock: 80, unit: "piece", category: "Accessories" },
    { name: "LED Desk Lamp", description: "Adjustable desk lamp with USB charging", price: 799, originalPrice: 999, stock: 20, unit: "piece", category: "Lighting" },
    { name: "Wireless Mouse", description: "Ergonomic wireless mouse with USB receiver", price: 599, stock: 40, unit: "piece", category: "Peripherals" },
    { name: "HDMI Cable", description: "High-speed HDMI cable, 2m", price: 349, stock: 50, unit: "piece", category: "Cables" },
    { name: "Webcam HD 720p", description: "HD webcam with microphone", price: 1299, stock: 15, unit: "piece", category: "Cameras" },
    { name: "Keyboard Wireless", description: "Slim wireless keyboard", price: 899, originalPrice: 1199, stock: 25, unit: "piece", category: "Peripherals" },
    { name: "Bluetooth Speaker", description: "Portable Bluetooth speaker 10W", price: 1499, stock: 20, unit: "piece", category: "Audio" },
  ],
  clothing: [
    { name: "Cotton T-Shirt", description: "100% cotton round neck t-shirt", price: 499, originalPrice: 699, stock: 50, unit: "piece", category: "Men" },
    { name: "Denim Jeans", description: "Slim fit blue denim jeans", price: 1299, stock: 30, unit: "piece", category: "Men" },
    { name: "Kurti", description: "Printed cotton kurti for women", price: 799, originalPrice: 999, stock: 40, unit: "piece", category: "Women" },
    { name: "Saree", description: "Silk saree with blouse piece", price: 2499, stock: 20, unit: "piece", category: "Women" },
    { name: "Kids T-Shirt", description: "Cartoon printed kids t-shirt", price: 299, stock: 60, unit: "piece", category: "Kids" },
    { name: "Formal Shirt", description: "Cotton formal shirt for men", price: 899, originalPrice: 1199, stock: 35, unit: "piece", category: "Men" },
    { name: "Palazzo Pants", description: "Comfortable palazzo pants for women", price: 599, stock: 45, unit: "piece", category: "Women" },
    { name: "Track Pants", description: "Sports track pants with pockets", price: 649, stock: 40, unit: "piece", category: "Sports" },
    { name: "Cotton Dupatta", description: "Handcrafted cotton dupatta", price: 349, stock: 50, unit: "piece", category: "Women" },
    { name: "Ethnic Kurta Set", description: "Traditional kurta pajama set", price: 1899, originalPrice: 2299, stock: 25, unit: "piece", category: "Men" },
  ],
  food: [
    { name: "Masala Dosa", description: "Crispy dosa with potato filling", price: 80, stock: 50, unit: "piece", category: "South Indian" },
    { name: "Butter Chicken", description: "Creamy butter chicken curry", price: 280, stock: 30, unit: "piece", category: "North Indian" },
    { name: "Paneer Tikka", description: "Grilled paneer with spices", price: 220, stock: 25, unit: "piece", category: "Starters" },
    { name: "Veg Biryani", description: "Aromatic vegetable biryani", price: 180, stock: 40, unit: "piece", category: "Rice" },
    { name: "Gulab Jamun", description: "Sweet milk dumplings, 4 pcs", price: 80, stock: 50, unit: "piece", category: "Desserts" },
    { name: "Chole Bhature", description: "Spiced chickpeas with fried bread", price: 120, stock: 35, unit: "piece", category: "North Indian" },
    { name: "Filter Coffee", description: "Traditional South Indian filter coffee", price: 40, stock: 100, unit: "piece", category: "Beverages" },
    { name: "Samosa", description: "Crispy potato filled samosa, 2 pcs", price: 30, stock: 80, unit: "piece", category: "Snacks" },
    { name: "Chicken Fried Rice", description: "Indo-Chinese style fried rice", price: 160, stock: 30, unit: "piece", category: "Chinese" },
    { name: "Lassi", description: "Sweet or salted yogurt drink", price: 50, stock: 60, unit: "piece", category: "Beverages" },
  ],
  services: [
    { name: "Phone Screen Repair", description: "Mobile screen replacement service", price: 1500, stock: 20, unit: "service", category: "Repair" },
    { name: "Laptop Service", description: "Complete laptop cleaning and service", price: 800, stock: 15, unit: "service", category: "Repair" },
    { name: "Haircut - Men", description: "Professional haircut for men", price: 200, stock: 50, unit: "service", category: "Salon" },
    { name: "Hair Spa", description: "Deep conditioning hair spa treatment", price: 800, originalPrice: 1000, stock: 30, unit: "service", category: "Salon" },
    { name: "AC Service", description: "Split AC cleaning and gas top-up", price: 599, stock: 10, unit: "service", category: "Home" },
    { name: "Facial Treatment", description: "Classic facial with cleanup", price: 500, stock: 25, unit: "service", category: "Salon" },
    { name: "Bike Service", description: "Complete two-wheeler service", price: 450, stock: 15, unit: "service", category: "Vehicle" },
    { name: "TV Repair", description: "LED/LCD TV repair service", price: 700, stock: 10, unit: "service", category: "Repair" },
    { name: "Plumbing Service", description: "Basic plumbing repair and maintenance", price: 350, stock: 20, unit: "service", category: "Home" },
    { name: "Manicure Pedicure", description: "Nail care and grooming service", price: 600, originalPrice: 750, stock: 30, unit: "service", category: "Salon" },
  ],
  other: [
    { name: "Dog Food 5kg", description: "Premium dry dog food", price: 1200, stock: 30, unit: "bag", category: "Pet Food" },
    { name: "Cat Food 2kg", description: "Nutritious cat food", price: 650, stock: 25, unit: "bag", category: "Pet Food" },
    { name: "Pet Shampoo", description: "Gentle shampoo for dogs and cats", price: 280, stock: 40, unit: "bottle", category: "Pet Care" },
    { name: "Dog Leash", description: "Durable nylon dog leash", price: 350, stock: 20, unit: "piece", category: "Accessories" },
    { name: "Cat Litter 5kg", description: "Clumping cat litter", price: 450, stock: 35, unit: "bag", category: "Pet Care" },
    { name: "Bird Cage", description: "Medium sized bird cage", price: 1500, originalPrice: 1800, stock: 10, unit: "piece", category: "Accessories" },
    { name: "Fish Food", description: "Tropical fish flakes, 100g", price: 150, stock: 50, unit: "bottle", category: "Pet Food" },
    { name: "Pet Bed", description: "Comfortable pet bed, medium", price: 899, stock: 15, unit: "piece", category: "Accessories" },
    { name: "Dog Toys Set", description: "Set of 5 chew toys", price: 399, stock: 30, unit: "set", category: "Toys" },
    { name: "Pet Collar", description: "Adjustable pet collar with bell", price: 199, stock: 40, unit: "piece", category: "Accessories" },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: { email: string; status: string; productsAdded?: number; error?: string }[] = [];

    for (const seller of demoSellers) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === seller.email);
        
        let userId: string;
        
        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: seller.email,
            password: seller.password,
            email_confirm: true,
            user_metadata: { full_name: seller.shopName },
          });

          if (authError) {
            results.push({ email: seller.email, status: "auth_error", error: authError.message });
            continue;
          }
          
          userId = authData.user.id;
        }

        // Check if seller already exists for this user
        const { data: existingSeller } = await supabase
          .from("sellers")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        let sellerId: string;

        if (!existingSeller) {
          // Create seller record
          const { data: newSeller, error: sellerError } = await supabase.from("sellers").insert({
            user_id: userId,
            shop_name: seller.shopName,
            shop_description: `Welcome to ${seller.shopName}! We offer quality products and services.`,
            category: seller.category,
            phone: seller.phone,
            address: seller.address,
            latitude: seller.lat,
            longitude: seller.lng,
            opening_hours: "09:00",
            closing_hours: "21:00",
            delivery_options: ["self_delivery", "customer_pickup"],
            is_approved: true,
            is_active: true,
            is_open: true,
          }).select("id").single();

          if (sellerError) {
            results.push({ email: seller.email, status: "seller_error", error: sellerError.message });
            continue;
          }

          sellerId = newSeller.id;

          // Add seller role
          await supabase.from("user_roles").upsert({
            user_id: userId,
            role: "seller",
          }, { onConflict: "user_id,role" });
        } else {
          sellerId = existingSeller.id;
        }

        // Check if products already exist for this seller
        const { data: existingProducts, error: countError } = await supabase
          .from("products")
          .select("id")
          .eq("seller_id", sellerId);

        const productsExist = existingProducts && existingProducts.length > 0;

        // Add sample products if not exists
        let productsAdded = 0;
        if (!productsExist) {
          const categoryProducts = productsByCategory[seller.category] || productsByCategory.other;
          
          const productsToInsert = categoryProducts.map(product => ({
            seller_id: sellerId,
            name: product.name,
            description: product.description,
            price: product.price,
            original_price: product.originalPrice || null,
            stock: product.stock,
            unit: product.unit,
            category: product.category,
            is_available: true,
          }));

          const { error: productError } = await supabase
            .from("products")
            .insert(productsToInsert);

          if (productError) {
            console.error(`Product error for ${seller.email}:`, productError);
          } else {
            productsAdded = productsToInsert.length;
          }
        }

        // Update credentials table with seller_id
        await supabase
          .from("seller_credentials")
          .update({ seller_id: sellerId, is_approved: true })
          .eq("email", seller.email);

        results.push({ 
          email: seller.email, 
          status: productsExist ? "exists_with_products" : "success", 
          productsAdded 
        });
      } catch (err: any) {
        console.error(`Error for ${seller.email}:`, err);
        results.push({ email: seller.email, status: "error", error: err.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
