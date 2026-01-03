-- FIX MISSING SHOP IMAGES
-- Run this in Supabase SQL Editor

-- Fix all shops without images
UPDATE public.sellers 
SET image_url = CASE 
  WHEN category = 'grocery' THEN 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600'
  WHEN category = 'medical' THEN 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=600'
  WHEN category = 'electronics' THEN 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=600'
  WHEN category = 'clothing' THEN 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?w=600'
  WHEN category = 'food' THEN 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=600'
  WHEN category = 'services' THEN 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=600'
  ELSE 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600'
END
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url LIKE '%unsplash%'
   OR image_url LIKE '%82lw9z3%';

-- Also update products without images
UPDATE public.products 
SET image_url = CASE 
  WHEN category IN ('Vegetables', 'Fruits', 'Grains', 'Dairy', 'Pulses') THEN 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?w=400'
  WHEN category IN ('Pain Relief', 'Vitamins', 'First Aid', 'Hygiene', 'Devices', 'Cold & Flu', 'Protection') THEN 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?w=400'
  WHEN category IN ('Accessories', 'Audio', 'Power', 'Wearables', 'Cameras', 'Peripherals', 'Lighting') THEN 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=400'
  WHEN category IN ('Men', 'Women', 'Unisex', 'Footwear') THEN 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?w=400'
  WHEN category IN ('Main Course', 'Rice', 'Pizza', 'Burgers', 'Starters', 'Breads', 'Desserts', 'Beverages', 'Sides', 'South Indian') THEN 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400'
  WHEN category IN ('Repair', 'Cleaning', 'Home Improvement', 'Laundry') THEN 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=400'
  ELSE 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=400'
END
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url LIKE '%unsplash%';

-- Confirm the fix
SELECT shop_name, category, 
       CASE WHEN image_url IS NOT NULL AND image_url != '' THEN '✅ Has Image' ELSE '❌ Missing' END as image_status
FROM public.sellers
ORDER BY category, shop_name;
