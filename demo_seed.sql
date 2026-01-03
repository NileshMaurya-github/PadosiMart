-- PADOSI MART DEMO DATA - 30 Shops with Products
-- Run this in Supabase SQL Editor

-- First, update existing shops without images
UPDATE public.sellers SET image_url = 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600' WHERE image_url IS NULL OR image_url = '';

-- Create demo users for shops
DO $$
DECLARE
  demo_user_id uuid;
  shop_id uuid;
  i int;
BEGIN
  -- Create a demo user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@padosimart.com') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
            'demo@padosimart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Demo User"}');
  END IF;
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@padosimart.com';

  -- GROCERY SHOPS (5)
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
      VALUES (
        CASE i WHEN 1 THEN 'Fresh Mart' WHEN 2 THEN 'Green Basket' WHEN 3 THEN 'Daily Needs' WHEN 4 THEN 'Organic Store' ELSE 'Super Bazaar' END,
        'Quality groceries and daily essentials at best prices',
        'grocery',
        i || ', Market Road, Delhi',
        '98765' || (10000 + i),
        28.6139 + (random() * 0.1 - 0.05),
        77.2090 + (random() * 0.1 - 0.05),
        CASE i WHEN 1 THEN 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600'
               WHEN 2 THEN 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?w=600'
               WHEN 3 THEN 'https://images.pexels.com/photos/1367243/pexels-photo-1367243.jpeg?w=600'
               WHEN 4 THEN 'https://images.pexels.com/photos/2733918/pexels-photo-2733918.jpeg?w=600'
               ELSE 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?w=600' END,
        true, true, true, 4.0 + (random() * 0.9), demo_user_id
      ) RETURNING id INTO shop_id;
      
      -- Add 10 grocery products
      INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available) VALUES
      ('Fresh Tomatoes (1kg)', 40, 50, 100, 'Vegetables', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?w=400', shop_id, true),
      ('Onions (1kg)', 35, 45, 150, 'Vegetables', 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?w=400', shop_id, true),
      ('Potatoes (1kg)', 30, null, 200, 'Vegetables', 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?w=400', shop_id, true),
      ('Bananas (1 dozen)', 60, 70, 80, 'Fruits', 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?w=400', shop_id, true),
      ('Apples (1kg)', 180, 200, 50, 'Fruits', 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?w=400', shop_id, true),
      ('Rice Basmati (5kg)', 450, 500, 40, 'Grains', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?w=400', shop_id, true),
      ('Whole Wheat Atta (5kg)', 280, 320, 60, 'Grains', 'https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?w=400', shop_id, true),
      ('Toor Dal (1kg)', 150, 180, 70, 'Pulses', 'https://images.pexels.com/photos/4198939/pexels-photo-4198939.jpeg?w=400', shop_id, true),
      ('Milk (1L)', 60, null, 100, 'Dairy', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=400', shop_id, true),
      ('Eggs (12 pcs)', 90, 100, 80, 'Dairy', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?w=400', shop_id, true);
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;

  -- MEDICAL SHOPS (5)
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
      VALUES (
        CASE i WHEN 1 THEN 'HealthPlus Pharmacy' WHEN 2 THEN 'MedCare' WHEN 3 THEN 'Apollo Pharmacy' WHEN 4 THEN 'Life Care' ELSE 'Wellness Store' END,
        '24/7 pharmacy with genuine medicines',
        'medical',
        i || ', Health Lane, Delhi',
        '98765' || (20000 + i),
        28.6139 + (random() * 0.1 - 0.05),
        77.2090 + (random() * 0.1 - 0.05),
        CASE i WHEN 1 THEN 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=600'
               WHEN 2 THEN 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?w=600'
               WHEN 3 THEN 'https://images.pexels.com/photos/3652097/pexels-photo-3652097.jpeg?w=600'
               WHEN 4 THEN 'https://images.pexels.com/photos/4047186/pexels-photo-4047186.jpeg?w=600'
               ELSE 'https://images.pexels.com/photos/3987153/pexels-photo-3987153.jpeg?w=600' END,
        true, true, true, 4.2 + (random() * 0.7), demo_user_id
      ) RETURNING id INTO shop_id;
      
      INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available) VALUES
      ('Paracetamol 500mg', 30, 500, 'Pain Relief', 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?w=400', shop_id, true),
      ('Vitamin C Tablets', 150, 200, 'Vitamins', 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?w=400', shop_id, true),
      ('Cough Syrup', 120, 100, 'Cold & Flu', 'https://images.pexels.com/photos/5699514/pexels-photo-5699514.jpeg?w=400', shop_id, true),
      ('Band-Aid Pack', 80, 150, 'First Aid', 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?w=400', shop_id, true),
      ('Hand Sanitizer 500ml', 199, 300, 'Hygiene', 'https://images.pexels.com/photos/3987142/pexels-photo-3987142.jpeg?w=400', shop_id, true),
      ('Face Masks (50 pcs)', 250, 100, 'Protection', 'https://images.pexels.com/photos/3873193/pexels-photo-3873193.jpeg?w=400', shop_id, true),
      ('Digital Thermometer', 350, 50, 'Devices', 'https://images.pexels.com/photos/3259624/pexels-photo-3259624.jpeg?w=400', shop_id, true),
      ('Blood Pressure Monitor', 1800, 20, 'Devices', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?w=400', shop_id, true),
      ('Multivitamin Capsules', 450, 80, 'Vitamins', 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?w=400', shop_id, true),
      ('Pain Relief Spray', 180, 70, 'Pain Relief', 'https://images.pexels.com/photos/3683047/pexels-photo-3683047.jpeg?w=400', shop_id, true);
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;

  -- ELECTRONICS SHOPS (5)
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
      VALUES (
        CASE i WHEN 1 THEN 'TechWorld' WHEN 2 THEN 'Gadget Hub' WHEN 3 THEN 'Digital Store' WHEN 4 THEN 'ElectroMart' ELSE 'Smart Shop' END,
        'Latest electronics and gadgets',
        'electronics',
        i || ', Tech Plaza, Delhi',
        '98765' || (30000 + i),
        28.6139 + (random() * 0.1 - 0.05),
        77.2090 + (random() * 0.1 - 0.05),
        CASE i WHEN 1 THEN 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=600'
               WHEN 2 THEN 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=600'
               WHEN 3 THEN 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600'
               WHEN 4 THEN 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?w=600'
               ELSE 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=600' END,
        true, true, true, 4.0 + (random() * 0.9), demo_user_id
      ) RETURNING id INTO shop_id;
      
      INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available) VALUES
      ('USB-C Charger', 599, 799, 100, 'Accessories', 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?w=400', shop_id, true),
      ('Wireless Earbuds', 1999, 2499, 50, 'Audio', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?w=400', shop_id, true),
      ('Phone Case', 299, 399, 200, 'Accessories', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=400', shop_id, true),
      ('Power Bank 10000mAh', 999, 1299, 80, 'Power', 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?w=400', shop_id, true),
      ('Bluetooth Speaker', 1499, 1999, 40, 'Audio', 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?w=400', shop_id, true),
      ('Smart Watch', 2999, 3999, 30, 'Wearables', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?w=400', shop_id, true),
      ('Laptop Stand', 799, 999, 60, 'Accessories', 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=400', shop_id, true),
      ('Webcam HD', 1299, 1599, 45, 'Cameras', 'https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?w=400', shop_id, true),
      ('Mouse Wireless', 499, 699, 90, 'Peripherals', 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?w=400', shop_id, true),
      ('LED Desk Lamp', 599, 799, 70, 'Lighting', 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?w=400', shop_id, true);
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;

  -- CLOTHING SHOPS (5)
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
      VALUES (
        CASE i WHEN 1 THEN 'Style Studio' WHEN 2 THEN 'Fashion Hub' WHEN 3 THEN 'Urban Wear' WHEN 4 THEN 'Trendy Threads' ELSE 'Cloth Corner' END,
        'Trendy fashion for everyone',
        'clothing',
        i || ', Fashion Street, Delhi',
        '98765' || (40000 + i),
        28.6139 + (random() * 0.1 - 0.05),
        77.2090 + (random() * 0.1 - 0.05),
        CASE i WHEN 1 THEN 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?w=600'
               WHEN 2 THEN 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?w=600'
               WHEN 3 THEN 'https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg?w=600'
               WHEN 4 THEN 'https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?w=600'
               ELSE 'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?w=600' END,
        true, true, true, 4.1 + (random() * 0.8), demo_user_id
      ) RETURNING id INTO shop_id;
      
      INSERT INTO public.products (name, price, original_price, stock, category, image_url, seller_id, is_available) VALUES
      ('Cotton T-Shirt', 499, 699, 150, 'Men', 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?w=400', shop_id, true),
      ('Denim Jeans', 1299, 1799, 80, 'Men', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?w=400', shop_id, true),
      ('Summer Dress', 1499, 1999, 60, 'Women', 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?w=400', shop_id, true),
      ('Casual Shirt', 799, 999, 100, 'Men', 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?w=400', shop_id, true),
      ('Hoodie', 999, 1299, 70, 'Unisex', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?w=400', shop_id, true),
      ('Kurti', 699, 899, 90, 'Women', 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?w=400', shop_id, true),
      ('Sports Shoes', 1999, 2499, 50, 'Footwear', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=400', shop_id, true),
      ('Sneakers', 1599, 1999, 60, 'Footwear', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=400', shop_id, true),
      ('Cap', 299, 399, 120, 'Accessories', 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?w=400', shop_id, true),
      ('Sunglasses', 599, 799, 80, 'Accessories', 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?w=400', shop_id, true);
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;

  -- FOOD SHOPS (5)
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
      VALUES (
        CASE i WHEN 1 THEN 'Spice Kitchen' WHEN 2 THEN 'Burger House' WHEN 3 THEN 'Pizza Palace' WHEN 4 THEN 'Biryani Hub' ELSE 'Sweet Corner' END,
        'Delicious food delivered hot',
        'food',
        i || ', Food Court, Delhi',
        '98765' || (50000 + i),
        28.6139 + (random() * 0.1 - 0.05),
        77.2090 + (random() * 0.1 - 0.05),
        CASE i WHEN 1 THEN 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=600'
               WHEN 2 THEN 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=600'
               WHEN 3 THEN 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?w=600'
               WHEN 4 THEN 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=600'
               ELSE 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=600' END,
        true, true, true, 4.3 + (random() * 0.6), demo_user_id
      ) RETURNING id INTO shop_id;
      
      INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available) VALUES
      ('Butter Chicken', 350, 50, 'Main Course', 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400', shop_id, true),
      ('Veg Biryani', 220, 60, 'Rice', 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400', shop_id, true),
      ('Cheese Pizza', 299, 40, 'Pizza', 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?w=400', shop_id, true),
      ('Burger Combo', 199, 80, 'Burgers', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=400', shop_id, true),
      ('Paneer Tikka', 280, 45, 'Starters', 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?w=400', shop_id, true),
      ('Naan (2 pcs)', 60, 100, 'Breads', 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?w=400', shop_id, true),
      ('Gulab Jamun (4 pcs)', 120, 60, 'Desserts', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=400', shop_id, true),
      ('Cold Coffee', 150, 70, 'Beverages', 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=400', shop_id, true),
      ('French Fries', 129, 90, 'Sides', 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?w=400', shop_id, true),
      ('Masala Dosa', 120, 55, 'South Indian', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?w=400', shop_id, true);
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;

  -- SERVICES SHOPS (5)
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, rating, user_id)
      VALUES (
        CASE i WHEN 1 THEN 'QuickFix Services' WHEN 2 THEN 'Home Help' WHEN 3 THEN 'Repair Pro' WHEN 4 THEN 'Clean Masters' ELSE 'HandyMan' END,
        'Professional home services',
        'services',
        i || ', Service Road, Delhi',
        '98765' || (60000 + i),
        28.6139 + (random() * 0.1 - 0.05),
        77.2090 + (random() * 0.1 - 0.05),
        CASE i WHEN 1 THEN 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=600'
               WHEN 2 THEN 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?w=600'
               WHEN 3 THEN 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=600'
               WHEN 4 THEN 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=600'
               ELSE 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?w=600' END,
        true, true, true, 4.0 + (random() * 0.9), demo_user_id
      ) RETURNING id INTO shop_id;
      
      INSERT INTO public.products (name, price, stock, category, image_url, seller_id, is_available) VALUES
      ('AC Repair', 500, 20, 'Repair', 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=400', shop_id, true),
      ('Plumbing Service', 300, 30, 'Repair', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400', shop_id, true),
      ('Electrician Visit', 250, 25, 'Repair', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400', shop_id, true),
      ('Home Cleaning', 800, 15, 'Cleaning', 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?w=400', shop_id, true),
      ('Carpet Cleaning', 600, 20, 'Cleaning', 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?w=400', shop_id, true),
      ('Painting (per room)', 2500, 10, 'Home Improvement', 'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?w=400', shop_id, true),
      ('Pest Control', 1200, 15, 'Cleaning', 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?w=400', shop_id, true),
      ('Appliance Repair', 400, 25, 'Repair', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?w=400', shop_id, true),
      ('Carpenter Service', 500, 20, 'Repair', 'https://images.pexels.com/photos/1249610/pexels-photo-1249610.jpeg?w=400', shop_id, true),
      ('Laundry Pickup', 150, 40, 'Laundry', 'https://images.pexels.com/photos/5591581/pexels-photo-5591581.jpeg?w=400', shop_id, true);
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;

END $$;
