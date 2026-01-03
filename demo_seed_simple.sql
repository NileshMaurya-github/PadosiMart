-- PADOSI MART DEMO DATA - Simple Version
-- Run this in Supabase SQL Editor

-- First get any existing user to link shops to
-- Or use NULL if your schema allows it

-- Update existing shops without images
UPDATE public.sellers SET image_url = 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600' 
WHERE image_url IS NULL OR image_url = '';

-- Delete existing demo shops to avoid duplicates (optional - comment out if you want to keep existing)
-- DELETE FROM public.products WHERE seller_id IN (SELECT id FROM public.sellers WHERE shop_name LIKE 'Demo %');
-- DELETE FROM public.sellers WHERE shop_name LIKE 'Demo %';

-- GROCERY SHOPS
INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating)
VALUES 
('Fresh Mart', 'Quality groceries and daily essentials', 'grocery', '1, Market Road, Delhi', '9876510001', 28.6139, 77.2090, 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600', true, true, true, 4.5),
('Green Basket', 'Organic vegetables and fruits', 'grocery', '2, Market Road, Delhi', '9876510002', 28.6200, 77.2100, 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?w=600', true, true, true, 4.7),
('Daily Needs', 'Your everyday grocery store', 'grocery', '3, Market Road, Delhi', '9876510003', 28.6150, 77.2150, 'https://images.pexels.com/photos/1367243/pexels-photo-1367243.jpeg?w=600', true, true, true, 4.3),
('Organic Store', 'Pure organic products', 'grocery', '4, Market Road, Delhi', '9876510004', 28.6180, 77.2050, 'https://images.pexels.com/photos/2733918/pexels-photo-2733918.jpeg?w=600', true, true, true, 4.8),
('Super Bazaar', 'One stop shop for all', 'grocery', '5, Market Road, Delhi', '9876510005', 28.6100, 77.2200, 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?w=600', true, true, true, 4.4);

-- MEDICAL SHOPS
INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating)
VALUES 
('HealthPlus Pharmacy', '24/7 pharmacy with genuine medicines', 'medical', '1, Health Lane, Delhi', '9876520001', 28.6250, 77.2180, 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=600', true, true, true, 4.9),
('MedCare', 'Your health partner', 'medical', '2, Health Lane, Delhi', '9876520002', 28.6170, 77.2220, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?w=600', true, true, true, 4.6),
('Apollo Pharmacy', 'Trusted healthcare', 'medical', '3, Health Lane, Delhi', '9876520003', 28.6220, 77.2080, 'https://images.pexels.com/photos/3652097/pexels-photo-3652097.jpeg?w=600', true, true, true, 4.8),
('Life Care', 'Complete medical solutions', 'medical', '4, Health Lane, Delhi', '9876520004', 28.6130, 77.2130, 'https://images.pexels.com/photos/4047186/pexels-photo-4047186.jpeg?w=600', true, true, true, 4.5),
('Wellness Store', 'Health and wellness products', 'medical', '5, Health Lane, Delhi', '9876520005', 28.6190, 77.2170, 'https://images.pexels.com/photos/3987153/pexels-photo-3987153.jpeg?w=600', true, true, true, 4.7);

-- ELECTRONICS SHOPS
INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating)
VALUES 
('TechWorld', 'Latest electronics and gadgets', 'electronics', '1, Tech Plaza, Delhi', '9876530001', 28.6300, 77.2250, 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=600', true, true, true, 4.6),
('Gadget Hub', 'All your tech needs', 'electronics', '2, Tech Plaza, Delhi', '9876530002', 28.6120, 77.2280, 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=600', true, true, true, 4.4),
('Digital Store', 'Digital lifestyle products', 'electronics', '3, Tech Plaza, Delhi', '9876530003', 28.6230, 77.2020, 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600', true, true, true, 4.5),
('ElectroMart', 'Electronics for everyone', 'electronics', '4, Tech Plaza, Delhi', '9876530004', 28.6160, 77.2300, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?w=600', true, true, true, 4.3),
('Smart Shop', 'Smart devices and accessories', 'electronics', '5, Tech Plaza, Delhi', '9876530005', 28.6280, 77.2120, 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=600', true, true, true, 4.7);

-- CLOTHING SHOPS
INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating)
VALUES 
('Style Studio', 'Trendy fashion for everyone', 'clothing', '1, Fashion Street, Delhi', '9876540001', 28.6350, 77.2350, 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?w=600', true, true, true, 4.7),
('Fashion Hub', 'Latest fashion trends', 'clothing', '2, Fashion Street, Delhi', '9876540002', 28.6110, 77.2380, 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?w=600', true, true, true, 4.5),
('Urban Wear', 'Urban streetwear', 'clothing', '3, Fashion Street, Delhi', '9876540003', 28.6240, 77.2030, 'https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg?w=600', true, true, true, 4.4),
('Trendy Threads', 'Fashionable clothing', 'clothing', '4, Fashion Street, Delhi', '9876540004', 28.6180, 77.2400, 'https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?w=600', true, true, true, 4.6),
('Cloth Corner', 'Affordable fashion', 'clothing', '5, Fashion Street, Delhi', '9876540005', 28.6320, 77.2150, 'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?w=600', true, true, true, 4.3);

-- FOOD SHOPS
INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating)
VALUES 
('Spice Kitchen', 'Authentic Indian cuisine', 'food', '1, Food Court, Delhi', '9876550001', 28.6400, 77.2450, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=600', true, true, true, 4.8),
('Burger House', 'Best burgers in town', 'food', '2, Food Court, Delhi', '9876550002', 28.6090, 77.2480, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=600', true, true, true, 4.5),
('Pizza Palace', 'Delicious pizzas', 'food', '3, Food Court, Delhi', '9876550003', 28.6260, 77.2010, 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?w=600', true, true, true, 4.6),
('Biryani Hub', 'Authentic biryani', 'food', '4, Food Court, Delhi', '9876550004', 28.6200, 77.2500, 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=600', true, true, true, 4.9),
('Sweet Corner', 'Indian sweets and desserts', 'food', '5, Food Court, Delhi', '9876550005', 28.6370, 77.2180, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=600', true, true, true, 4.7);

-- SERVICES SHOPS
INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating)
VALUES 
('QuickFix Services', 'Professional home services', 'services', '1, Service Road, Delhi', '9876560001', 28.6450, 77.2550, 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=600', true, true, true, 4.6),
('Home Help', 'Home repair and maintenance', 'services', '2, Service Road, Delhi', '9876560002', 28.6080, 77.2580, 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?w=600', true, true, true, 4.4),
('Repair Pro', 'Expert repair services', 'services', '3, Service Road, Delhi', '9876560003', 28.6270, 77.2000, 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=600', true, true, true, 4.5),
('Clean Masters', 'Professional cleaning services', 'services', '4, Service Road, Delhi', '9876560004', 28.6210, 77.2600, 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=600', true, true, true, 4.7),
('HandyMan', 'All home services', 'services', '5, Service Road, Delhi', '9876560005', 28.6420, 77.2200, 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?w=600', true, true, true, 4.3);

-- Now add products to each shop
-- Products for Fresh Mart (grocery)
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Fresh Tomatoes (1kg)', 40, 50, 100, 'Vegetables', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Onions (1kg)', 35, 45, 150, 'Vegetables', 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Potatoes (1kg)', 30, NULL, 200, 'Vegetables', 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Bananas (1 dozen)', 60, 70, 80, 'Fruits', 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Apples (1kg)', 180, 200, 50, 'Fruits', 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Rice Basmati (5kg)', 450, 500, 40, 'Grains', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Whole Wheat Atta (5kg)', 280, 320, 60, 'Grains', 'https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Toor Dal (1kg)', 150, 180, 70, 'Pulses', 'https://images.pexels.com/photos/4198939/pexels-photo-4198939.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Milk (1L)', 60, NULL, 100, 'Dairy', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart'
UNION ALL SELECT 'Eggs (12 pcs)', 90, 100, 80, 'Dairy', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart';

-- Products for HealthPlus Pharmacy (medical)
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Paracetamol 500mg', 30, 500, 'Pain Relief', 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Vitamin C Tablets', 150, 200, 'Vitamins', 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Cough Syrup', 120, 100, 'Cold & Flu', 'https://images.pexels.com/photos/5699514/pexels-photo-5699514.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Band-Aid Pack', 80, 150, 'First Aid', 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Hand Sanitizer', 199, 300, 'Hygiene', 'https://images.pexels.com/photos/3987142/pexels-photo-3987142.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Face Masks (50 pcs)', 250, 100, 'Protection', 'https://images.pexels.com/photos/3873193/pexels-photo-3873193.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Digital Thermometer', 350, 50, 'Devices', 'https://images.pexels.com/photos/3259624/pexels-photo-3259624.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'BP Monitor', 1800, 20, 'Devices', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Multivitamin', 450, 80, 'Vitamins', 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy'
UNION ALL SELECT 'Pain Relief Spray', 180, 70, 'Pain Relief', 'https://images.pexels.com/photos/3683047/pexels-photo-3683047.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy';

-- Products for TechWorld (electronics)
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'USB-C Charger', 599, 799, 100, 'Accessories', 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Wireless Earbuds', 1999, 2499, 50, 'Audio', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Phone Case', 299, 399, 200, 'Accessories', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Power Bank 10000mAh', 999, 1299, 80, 'Power', 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Bluetooth Speaker', 1499, 1999, 40, 'Audio', 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Smart Watch', 2999, 3999, 30, 'Wearables', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Laptop Stand', 799, 999, 60, 'Accessories', 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Webcam HD', 1299, 1599, 45, 'Cameras', 'https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'Wireless Mouse', 499, 699, 90, 'Peripherals', 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld'
UNION ALL SELECT 'LED Desk Lamp', 599, 799, 70, 'Lighting', 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld';

-- Products for Style Studio (clothing)
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Cotton T-Shirt', 499, 699, 150, 'Men', 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Denim Jeans', 1299, 1799, 80, 'Men', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Summer Dress', 1499, 1999, 60, 'Women', 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Casual Shirt', 799, 999, 100, 'Men', 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Hoodie', 999, 1299, 70, 'Unisex', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Kurti', 699, 899, 90, 'Women', 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Sports Shoes', 1999, 2499, 50, 'Footwear', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Sneakers', 1599, 1999, 60, 'Footwear', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Cap', 299, 399, 120, 'Accessories', 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio'
UNION ALL SELECT 'Sunglasses', 599, 799, 80, 'Accessories', 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio';

-- Products for Spice Kitchen (food)
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Butter Chicken', 350, 50, 'Main Course', 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Veg Biryani', 220, 60, 'Rice', 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Cheese Pizza', 299, 40, 'Pizza', 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Burger Combo', 199, 80, 'Burgers', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Paneer Tikka', 280, 45, 'Starters', 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Naan (2 pcs)', 60, 100, 'Breads', 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Gulab Jamun', 120, 60, 'Desserts', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Cold Coffee', 150, 70, 'Beverages', 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'French Fries', 129, 90, 'Sides', 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen'
UNION ALL SELECT 'Masala Dosa', 120, 55, 'South Indian', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen';

-- Products for QuickFix Services
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'AC Repair', 500, 20, 'Repair', 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Plumbing Service', 300, 30, 'Repair', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Electrician Visit', 250, 25, 'Repair', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Home Cleaning', 800, 15, 'Cleaning', 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Carpet Cleaning', 600, 20, 'Cleaning', 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Painting Service', 2500, 10, 'Home Improvement', 'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Pest Control', 1200, 15, 'Cleaning', 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Appliance Repair', 400, 25, 'Repair', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Carpenter Service', 500, 20, 'Repair', 'https://images.pexels.com/photos/1249610/pexels-photo-1249610.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services'
UNION ALL SELECT 'Laundry Pickup', 150, 40, 'Laundry', 'https://images.pexels.com/photos/5591581/pexels-photo-5591581.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services';
