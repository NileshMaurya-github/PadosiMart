-- PADOSI MART DEMO DATA
-- Step 1: First run this query to get an existing user ID
-- SELECT id, email FROM auth.users LIMIT 1;
-- Copy that ID and replace 'YOUR_USER_ID_HERE' below

-- OR run this first to create a demo user:
-- You need to sign up via the app first, then use that user's ID

-- OPTION: Use this query to find your user ID after signing up:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- ============================================================
-- REPLACE THIS WITH YOUR ACTUAL USER ID FROM auth.users table
-- ============================================================
DO $$
DECLARE
  demo_uid uuid;
BEGIN
  -- Get the first available user from auth.users
  SELECT id INTO demo_uid FROM auth.users LIMIT 1;
  
  IF demo_uid IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first via the app, then run this script.';
  END IF;

  -- Update existing shops without images
  UPDATE public.sellers SET image_url = 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600' 
  WHERE image_url IS NULL OR image_url = '';

  -- GROCERY SHOPS (5)
  INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
  VALUES 
  ('Fresh Mart', 'Quality groceries and daily essentials', 'grocery', '1, Market Road, Delhi', '9876510001', 28.6139, 77.2090, 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600', true, true, true, 4.5, demo_uid),
  ('Green Basket', 'Organic vegetables and fruits', 'grocery', '2, Market Road, Delhi', '9876510002', 28.6200, 77.2100, 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?w=600', true, true, true, 4.7, demo_uid),
  ('Daily Needs', 'Your everyday grocery store', 'grocery', '3, Market Road, Delhi', '9876510003', 28.6150, 77.2150, 'https://images.pexels.com/photos/1367243/pexels-photo-1367243.jpeg?w=600', true, true, true, 4.3, demo_uid),
  ('Organic Store', 'Pure organic products', 'grocery', '4, Market Road, Delhi', '9876510004', 28.6180, 77.2050, 'https://images.pexels.com/photos/2733918/pexels-photo-2733918.jpeg?w=600', true, true, true, 4.8, demo_uid),
  ('Super Bazaar', 'One stop shop for all', 'grocery', '5, Market Road, Delhi', '9876510005', 28.6100, 77.2200, 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?w=600', true, true, true, 4.4, demo_uid)
  ON CONFLICT DO NOTHING;

  -- MEDICAL SHOPS (5)
  INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
  VALUES 
  ('HealthPlus Pharmacy', '24/7 pharmacy', 'medical', '1, Health Lane, Delhi', '9876520001', 28.6250, 77.2180, 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=600', true, true, true, 4.9, demo_uid),
  ('MedCare', 'Your health partner', 'medical', '2, Health Lane, Delhi', '9876520002', 28.6170, 77.2220, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?w=600', true, true, true, 4.6, demo_uid),
  ('Apollo Pharmacy', 'Trusted healthcare', 'medical', '3, Health Lane, Delhi', '9876520003', 28.6220, 77.2080, 'https://images.pexels.com/photos/3652097/pexels-photo-3652097.jpeg?w=600', true, true, true, 4.8, demo_uid),
  ('Life Care', 'Complete medical solutions', 'medical', '4, Health Lane, Delhi', '9876520004', 28.6130, 77.2130, 'https://images.pexels.com/photos/4047186/pexels-photo-4047186.jpeg?w=600', true, true, true, 4.5, demo_uid),
  ('Wellness Store', 'Health products', 'medical', '5, Health Lane, Delhi', '9876520005', 28.6190, 77.2170, 'https://images.pexels.com/photos/3987153/pexels-photo-3987153.jpeg?w=600', true, true, true, 4.7, demo_uid)
  ON CONFLICT DO NOTHING;

  -- ELECTRONICS SHOPS (5)
  INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
  VALUES 
  ('TechWorld', 'Latest gadgets', 'electronics', '1, Tech Plaza, Delhi', '9876530001', 28.6300, 77.2250, 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=600', true, true, true, 4.6, demo_uid),
  ('Gadget Hub', 'All tech needs', 'electronics', '2, Tech Plaza, Delhi', '9876530002', 28.6120, 77.2280, 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=600', true, true, true, 4.4, demo_uid),
  ('Digital Store', 'Digital products', 'electronics', '3, Tech Plaza, Delhi', '9876530003', 28.6230, 77.2020, 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600', true, true, true, 4.5, demo_uid),
  ('ElectroMart', 'Electronics for all', 'electronics', '4, Tech Plaza, Delhi', '9876530004', 28.6160, 77.2300, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?w=600', true, true, true, 4.3, demo_uid),
  ('Smart Shop', 'Smart devices', 'electronics', '5, Tech Plaza, Delhi', '9876530005', 28.6280, 77.2120, 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=600', true, true, true, 4.7, demo_uid)
  ON CONFLICT DO NOTHING;

  -- CLOTHING SHOPS (5)
  INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
  VALUES 
  ('Style Studio', 'Trendy fashion', 'clothing', '1, Fashion Street, Delhi', '9876540001', 28.6350, 77.2350, 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?w=600', true, true, true, 4.7, demo_uid),
  ('Fashion Hub', 'Latest trends', 'clothing', '2, Fashion Street, Delhi', '9876540002', 28.6110, 77.2380, 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?w=600', true, true, true, 4.5, demo_uid),
  ('Urban Wear', 'Urban streetwear', 'clothing', '3, Fashion Street, Delhi', '9876540003', 28.6240, 77.2030, 'https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg?w=600', true, true, true, 4.4, demo_uid),
  ('Trendy Threads', 'Fashion clothing', 'clothing', '4, Fashion Street, Delhi', '9876540004', 28.6180, 77.2400, 'https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?w=600', true, true, true, 4.6, demo_uid),
  ('Cloth Corner', 'Affordable fashion', 'clothing', '5, Fashion Street, Delhi', '9876540005', 28.6320, 77.2150, 'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?w=600', true, true, true, 4.3, demo_uid)
  ON CONFLICT DO NOTHING;

  -- FOOD SHOPS (5)
  INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
  VALUES 
  ('Spice Kitchen', 'Indian cuisine', 'food', '1, Food Court, Delhi', '9876550001', 28.6400, 77.2450, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=600', true, true, true, 4.8, demo_uid),
  ('Burger House', 'Best burgers', 'food', '2, Food Court, Delhi', '9876550002', 28.6090, 77.2480, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=600', true, true, true, 4.5, demo_uid),
  ('Pizza Palace', 'Delicious pizzas', 'food', '3, Food Court, Delhi', '9876550003', 28.6260, 77.2010, 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?w=600', true, true, true, 4.6, demo_uid),
  ('Biryani Hub', 'Authentic biryani', 'food', '4, Food Court, Delhi', '9876550004', 28.6200, 77.2500, 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=600', true, true, true, 4.9, demo_uid),
  ('Sweet Corner', 'Indian sweets', 'food', '5, Food Court, Delhi', '9876550005', 28.6370, 77.2180, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=600', true, true, true, 4.7, demo_uid)
  ON CONFLICT DO NOTHING;

  -- SERVICES SHOPS (5)
  INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
  VALUES 
  ('QuickFix Services', 'Home services', 'services', '1, Service Road, Delhi', '9876560001', 28.6450, 77.2550, 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=600', true, true, true, 4.6, demo_uid),
  ('Home Help', 'Home repair', 'services', '2, Service Road, Delhi', '9876560002', 28.6080, 77.2580, 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?w=600', true, true, true, 4.4, demo_uid),
  ('Repair Pro', 'Expert repairs', 'services', '3, Service Road, Delhi', '9876560003', 28.6270, 77.2000, 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=600', true, true, true, 4.5, demo_uid),
  ('Clean Masters', 'Cleaning services', 'services', '4, Service Road, Delhi', '9876560004', 28.6210, 77.2600, 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=600', true, true, true, 4.7, demo_uid),
  ('HandyMan', 'All services', 'services', '5, Service Road, Delhi', '9876560005', 28.6420, 77.2200, 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?w=600', true, true, true, 4.3, demo_uid)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Created 30 demo shops successfully!';
END $$;

-- Now add products to shops
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Fresh Tomatoes (1kg)', 40, 50, 100, 'Vegetables', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Onions (1kg)', 35, 45, 150, 'Vegetables', 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Potatoes (1kg)', 30, 200, 'Vegetables', 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Bananas (1 dozen)', 60, 70, 80, 'Fruits', 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Apples (1kg)', 180, 200, 50, 'Fruits', 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Rice Basmati (5kg)', 450, 500, 40, 'Grains', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Whole Wheat Atta', 280, 320, 60, 'Grains', 'https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Toor Dal (1kg)', 150, 180, 70, 'Pulses', 'https://images.pexels.com/photos/4198939/pexels-photo-4198939.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Milk (1L)', 60, 100, 'Dairy', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Eggs (12 pcs)', 90, 100, 80, 'Dairy', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Fresh Mart' LIMIT 1;

-- Medical products
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Paracetamol', 30, 500, 'Pain Relief', 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Vitamin C', 150, 200, 'Vitamins', 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Cough Syrup', 120, 100, 'Cold & Flu', 'https://images.pexels.com/photos/5699514/pexels-photo-5699514.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Band-Aid Pack', 80, 150, 'First Aid', 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Hand Sanitizer', 199, 300, 'Hygiene', 'https://images.pexels.com/photos/3987142/pexels-photo-3987142.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'HealthPlus Pharmacy' LIMIT 1;

-- Electronics products
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'USB-C Charger', 599, 799, 100, 'Accessories', 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Wireless Earbuds', 1999, 2499, 50, 'Audio', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Power Bank', 999, 1299, 80, 'Power', 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Smart Watch', 2999, 3999, 30, 'Wearables', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Bluetooth Speaker', 1499, 1999, 40, 'Audio', 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'TechWorld' LIMIT 1;

-- Clothing products
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Cotton T-Shirt', 499, 699, 150, 'Men', 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Denim Jeans', 1299, 1799, 80, 'Men', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Summer Dress', 1499, 1999, 60, 'Women', 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Sports Shoes', 1999, 2499, 50, 'Footwear', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio' LIMIT 1;
INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available)
SELECT 'Hoodie', 999, 1299, 70, 'Unisex', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Style Studio' LIMIT 1;

-- Food products
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Butter Chicken', 350, 50, 'Main Course', 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Veg Biryani', 220, 60, 'Rice', 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Cheese Pizza', 299, 40, 'Pizza', 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Burger Combo', 199, 80, 'Burgers', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Masala Dosa', 120, 55, 'South Indian', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'Spice Kitchen' LIMIT 1;

-- Services products
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'AC Repair', 500, 20, 'Repair', 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Plumbing Service', 300, 30, 'Repair', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Electrician Visit', 250, 25, 'Repair', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Home Cleaning', 800, 15, 'Cleaning', 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services' LIMIT 1;
INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available)
SELECT 'Pest Control', 1200, 15, 'Cleaning', 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?w=400', id, true FROM public.sellers WHERE shop_name = 'QuickFix Services' LIMIT 1;
