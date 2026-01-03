
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


// Use crypto.randomUUID if available (modern browsers)
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const DEMO_LOCATION = {
    lat: 19.0760, // Mumbai
    lng: 72.8777
};

// Generate a random UUID if needed (though Supabase might handle it, we need IDs to link products)
// Since we don't have the uuid package installed and I can't look at node_modules easily, I'll use crypto.randomUUID if in browser or a simple random string generator if not.
// Actually, I can use crypto.randomUUID() which is standard in modern browsers/environments.

const SHOP_CATEGORIES = [
    "grocery",
    "medical",
    "electronics",
    "clothing",
    "food",
    "services"
] as const;

const DEMO_SHOPS = [
    {
        name: "Fresh Mart Supermarket",
        category: "grocery",
        description: "Your daily stop for fresh vegetables and fruits.",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
        products: [
            { name: "Fresh Tomatoes", price: 40, unit: "kg", stock: 100, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80" },
            { name: "Organic Bananas", price: 60, unit: "dozen", stock: 50, image: "https://images.unsplash.com/photo-1603833665858-e61d17a86271?w=800&q=80" },
            { name: "Whole Wheat Bread", price: 45, unit: "pack", stock: 20, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80" },
            { name: "Milk (1L)", price: 70, unit: "litre", stock: 200, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80" },
        ]
    },
    {
        name: "Wellness Pharmacy",
        category: "medical",
        description: "24/7 Pharmacy store for all your medical needs.",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
        products: [
            { name: "Paracetamol", price: 30, unit: "strip", stock: 500, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80" },
            { name: "Bandages", price: 100, unit: "pack", stock: 50, image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80" },
            { name: "Vitamin C Supplements", price: 250, unit: "bottle", stock: 30, image: "https://images.unsplash.com/photo-1550572017-edc9f6565166?w=800&q=80" },
        ]
    },
    {
        name: "Tech Zone",
        category: "electronics",
        description: "Latest gadgets and mobile accessories.",
        image: "https://images.unsplash.com/photo-1531297461136-82lw9z3-w800?w=800&q=80",
        products: [
            { name: "USB-C Cable", price: 300, unit: "piece", stock: 100, image: "https://images.unsplash.com/photo-1542125387-c71274d94f0a?w=800&q=80" },
            { name: "Wireless Earbuds", price: 1500, unit: "pair", stock: 20, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80" },
        ]
    },
    {
        name: "Fashion Hub",
        category: "clothing",
        description: "Trendy clothes for men and women.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        products: [
            { name: "Cotton T-Shirt", price: 500, unit: "piece", stock: 50, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
            { name: "Denim Jeans", price: 1200, unit: "piece", stock: 30, image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800&q=80" },
        ]
    },
    {
        name: "Tasty Bites Restaurant",
        category: "food",
        description: "Delicious fast food and meals.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        products: [
            { name: "Veg Burger", price: 150, unit: "piece", stock: 50, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
            { name: "Pizza", price: 400, unit: "medium", stock: 20, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
        ]
    },
    {
        name: "Electro Fix Services",
        category: "services",
        description: "Expert repair for all appliances.",
        image: "https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800&q=80",
        products: [
            { name: "AC Service", price: 500, unit: "service", stock: 100, image: "https://images.unsplash.com/photo-1621252179027-94459d2713dc?w=800&q=80" },
            { name: "Laptop Repair (Diagnosis)", price: 300, unit: "service", stock: 100, image: "https://images.unsplash.com/photo-1597872250990-211bc1c27738?w=800&q=80" },
        ]
    }
];

export const seedDemoData = async () => {
    try {
        console.log("Starting seed process...");

        // 1. Check if demo data (Fresh Mart) already exists
        const { data: existingDemo } = await supabase
            .from("sellers")
            .select("id")
            .eq("shop_name", "Fresh Mart Supermarket")
            .maybeSingle();

        if (existingDemo) {
            toast.info("Demo data already exists.", {
                description: "Fresh Mart Supermarket found. Skipping seed."
            });
            return;
        }

        // 2. Insert Sellers
        // Note: We are using random UUIDs for user_id. This will only work if there is no strict FK reference to auth.users,
        // OR if RLS allows it. If it fails, we know we need real users.

        let sellersCreated = 0;
        let productsCreated = 0;

        for (const shop of DEMO_SHOPS) {
            // Create a random user UUID (mock)
            const mockUserId = generateUUID();

            // Jitter location slightly so they aren't all on top of each other
            const lat = DEMO_LOCATION.lat + (Math.random() - 0.5) * 0.02;
            const lng = DEMO_LOCATION.lng + (Math.random() - 0.5) * 0.02;

            const { data: sellerData, error: sellerError } = await supabase
                .from("sellers")
                .insert({
                    user_id: mockUserId,
                    shop_name: shop.name,
                    shop_description: shop.description,
                    category: shop.category,
                    address: `Shop No. ${Math.floor(Math.random() * 100)}, Demo Street, Mumbai`,
                    phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
                    latitude: lat,
                    longitude: lng,
                    is_approved: true,
                    is_active: true,
                    is_open: true,
                    image_url: shop.image,
                    delivery_options: ["self_delivery", "customer_pickup"],
                    opening_hours: "09:00",
                    closing_hours: "22:00"
                })
                .select() // Select to get the ID
                .single();

            if (sellerError) {
                console.error(`Failed to create shop ${shop.name}:`, sellerError);
                continue;
            }

            sellersCreated++;

            // 3. Insert Products for this seller
            if (sellerData && shop.products) {
                const productsWithSeller = shop.products.map(p => ({
                    seller_id: sellerData.id,
                    name: p.name,
                    price: p.price,
                    stock: p.stock,
                    unit: p.unit,
                    category: shop.category, // Use shop category for product category for simplicity
                    image_url: p.image,
                    is_available: true,
                    description: `Fresh quality ${p.name}`
                }));

                const { error: prodError } = await supabase
                    .from("products")
                    .insert(productsWithSeller);

                if (prodError) {
                    console.error(`Failed to create products for ${shop.name}:`, prodError);
                } else {
                    productsCreated += shop.products.length;
                }
            }
        }

        if (sellersCreated > 0) {
            toast.success("Demo data seeded successfully!", {
                description: `Created ${sellersCreated} shops and ${productsCreated} products.`
            });
            // Reload to show data
            setTimeout(() => window.location.reload(), 1500);
        } else {
            toast.error("Failed to seed data. Check console for details.");
        }

    } catch (err: any) {
        console.error("Seed error:", err);
        toast.error("Failed to run seed script", {
            description: err.message
        });
    }
};
