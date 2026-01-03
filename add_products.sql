-- ADD PRODUCTS TO ALL SHOPS
-- Run this after the shops are created

-- First, let's see all shops
-- SELECT id, shop_name, category FROM public.sellers;

-- Add products to ALL grocery shops
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT p.name, p.price, p.original_price, p.stock, p.category, p.image_url, s.id, true
FROM public.sellers s
CROSS JOIN (
  VALUES 
    ('Fresh Tomatoes (1kg)', 40, 50, 100, 'Vegetables', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?w=400'),
    ('Onions (1kg)', 35, 45, 150, 'Vegetables', 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?w=400'),
    ('Potatoes (1kg)', 30, 40, 200, 'Vegetables', 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?w=400'),
    ('Bananas (1 dozen)', 60, 70, 80, 'Fruits', 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?w=400'),
    ('Apples (1kg)', 180, 200, 50, 'Fruits', 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?w=400'),
    ('Rice Basmati (5kg)', 450, 500, 40, 'Grains', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?w=400'),
    ('Whole Wheat Atta', 280, 320, 60, 'Grains', 'https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?w=400'),
    ('Toor Dal (1kg)', 150, 180, 70, 'Pulses', 'https://images.pexels.com/photos/4198939/pexels-photo-4198939.jpeg?w=400'),
    ('Milk (1L)', 60, 65, 100, 'Dairy', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=400'),
    ('Eggs (12 pcs)', 90, 100, 80, 'Dairy', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?w=400')
) AS p(name, price, original_price, stock, category, image_url)
WHERE s.category = 'grocery';

-- Add products to ALL medical shops
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT p.name, p.price, p.original_price, p.stock, p.category, p.image_url, s.id, true
FROM public.sellers s
CROSS JOIN (
  VALUES 
    ('Paracetamol 500mg', 30, 35, 500, 'Pain Relief', 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?w=400'),
    ('Vitamin C Tablets', 150, 180, 200, 'Vitamins', 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?w=400'),
    ('Cough Syrup', 120, 150, 100, 'Cold & Flu', 'https://images.pexels.com/photos/5699514/pexels-photo-5699514.jpeg?w=400'),
    ('Band-Aid Pack', 80, 100, 150, 'First Aid', 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?w=400'),
    ('Hand Sanitizer', 199, 250, 300, 'Hygiene', 'https://images.pexels.com/photos/3987142/pexels-photo-3987142.jpeg?w=400'),
    ('Face Masks (50pcs)', 250, 300, 100, 'Protection', 'https://images.pexels.com/photos/3873193/pexels-photo-3873193.jpeg?w=400'),
    ('Digital Thermometer', 350, 450, 50, 'Devices', 'https://images.pexels.com/photos/3259624/pexels-photo-3259624.jpeg?w=400'),
    ('BP Monitor', 1800, 2200, 20, 'Devices', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?w=400'),
    ('Multivitamin', 450, 550, 80, 'Vitamins', 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?w=400'),
    ('Pain Relief Spray', 180, 220, 70, 'Pain Relief', 'https://images.pexels.com/photos/3683047/pexels-photo-3683047.jpeg?w=400')
) AS p(name, price, original_price, stock, category, image_url)
WHERE s.category = 'medical';

-- Add products to ALL electronics shops
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT p.name, p.price, p.original_price, p.stock, p.category, p.image_url, s.id, true
FROM public.sellers s
CROSS JOIN (
  VALUES 
    ('USB-C Charger', 599, 799, 100, 'Accessories', 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?w=400'),
    ('Wireless Earbuds', 1999, 2499, 50, 'Audio', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400'),
    ('Phone Case', 299, 399, 200, 'Accessories', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=400'),
    ('Power Bank 10000mAh', 999, 1299, 80, 'Power', 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?w=400'),
    ('Bluetooth Speaker', 1499, 1999, 40, 'Audio', 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?w=400'),
    ('Smart Watch', 2999, 3999, 30, 'Wearables', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?w=400'),
    ('Laptop Stand', 799, 999, 60, 'Accessories', 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=400'),
    ('Webcam HD', 1299, 1599, 45, 'Cameras', 'https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?w=400'),
    ('Wireless Mouse', 499, 699, 90, 'Peripherals', 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?w=400'),
    ('LED Desk Lamp', 599, 799, 70, 'Lighting', 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?w=400')
) AS p(name, price, original_price, stock, category, image_url)
WHERE s.category = 'electronics';

-- Add products to ALL clothing shops
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT p.name, p.price, p.original_price, p.stock, p.category, p.image_url, s.id, true
FROM public.sellers s
CROSS JOIN (
  VALUES 
    ('Cotton T-Shirt', 499, 699, 150, 'Men', 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?w=400'),
    ('Denim Jeans', 1299, 1799, 80, 'Men', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?w=400'),
    ('Summer Dress', 1499, 1999, 60, 'Women', 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?w=400'),
    ('Casual Shirt', 799, 999, 100, 'Men', 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?w=400'),
    ('Hoodie', 999, 1299, 70, 'Unisex', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?w=400'),
    ('Kurti', 699, 899, 90, 'Women', 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?w=400'),
    ('Sports Shoes', 1999, 2499, 50, 'Footwear', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=400'),
    ('Sneakers', 1599, 1999, 60, 'Footwear', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=400'),
    ('Cap', 299, 399, 120, 'Accessories', 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?w=400'),
    ('Sunglasses', 599, 799, 80, 'Accessories', 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?w=400')
) AS p(name, price, original_price, stock, category, image_url)
WHERE s.category = 'clothing';

-- Add products to ALL food shops
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT p.name, p.price, p.original_price, p.stock, p.category, p.image_url, s.id, true
FROM public.sellers s
CROSS JOIN (
  VALUES 
    ('Butter Chicken', 350, 400, 50, 'Main Course', 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400'),
    ('Veg Biryani', 220, 280, 60, 'Rice', 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400'),
    ('Cheese Pizza', 299, 350, 40, 'Pizza', 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?w=400'),
    ('Burger Combo', 199, 249, 80, 'Burgers', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=400'),
    ('Paneer Tikka', 280, 350, 45, 'Starters', 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?w=400'),
    ('Naan (2 pcs)', 60, 80, 100, 'Breads', 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?w=400'),
    ('Gulab Jamun', 120, 150, 60, 'Desserts', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=400'),
    ('Cold Coffee', 150, 180, 70, 'Beverages', 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=400'),
    ('French Fries', 129, 159, 90, 'Sides', 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?w=400'),
    ('Masala Dosa', 120, 150, 55, 'South Indian', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?w=400')
) AS p(name, price, original_price, stock, category, image_url)
WHERE s.category = 'food';

-- Add products to ALL services shops
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT p.name, p.price, p.original_price, p.stock, p.category, p.image_url, s.id, true
FROM public.sellers s
CROSS JOIN (
  VALUES 
    ('AC Repair', 500, 700, 20, 'Repair', 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=400'),
    ('Plumbing Service', 300, 400, 30, 'Repair', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400'),
    ('Electrician Visit', 250, 350, 25, 'Repair', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400'),
    ('Home Cleaning', 800, 1000, 15, 'Cleaning', 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=400'),
    ('Carpet Cleaning', 600, 800, 20, 'Cleaning', 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?w=400'),
    ('Painting Service', 2500, 3000, 10, 'Home Improvement', 'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?w=400'),
    ('Pest Control', 1200, 1500, 15, 'Cleaning', 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?w=400'),
    ('Appliance Repair', 400, 550, 25, 'Repair', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?w=400'),
    ('Carpenter Service', 500, 700, 20, 'Repair', 'https://images.pexels.com/photos/1249610/pexels-photo-1249610.jpeg?w=400'),
    ('Laundry Pickup', 150, 200, 40, 'Laundry', 'https://images.pexels.com/photos/5591581/pexels-photo-5591581.jpeg?w=400')
) AS p(name, price, original_price, stock, category, image_url)
WHERE s.category = 'services';

-- Check how many products were added
SELECT 
  s.category,
  s.shop_name,
  COUNT(p.id) as product_count
FROM public.sellers s
LEFT JOIN public.products p ON p.seller_id = s.id
GROUP BY s.category, s.shop_name
ORDER BY s.category, s.shop_name;
