
-- COMPREHENSIVE SEED DATA (10 SHOPS across categories)
DO $$
DECLARE
    -- User IDs
    grocer_uid uuid;
    pharma_uid uuid;
    tech_uid uuid;
    fashion_uid uuid;
    foodie_uid uuid;
    service_uid uuid;
    
    -- Shop IDs
    shop_id uuid;
BEGIN
    -- 1. SETUP USERS (We reuse users for multiple shops just for demo purposes, 
    -- BUT we must create creating unique logins if the app enforces strict 1-shop-1-user.
    -- To stay safe, I will create 6 distinct users for different categories.

    -- Helper to create user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'grocer@localmart.com') THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'grocer@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Grocer Bob"}');
    END IF;
    SELECT id INTO grocer_uid FROM auth.users WHERE email = 'grocer@localmart.com';

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pharma@localmart.com') THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pharma@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Dr. Sarah"}');
    END IF;
    SELECT id INTO pharma_uid FROM auth.users WHERE email = 'pharma@localmart.com';

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tech@localmart.com') THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tech@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Tech Tom"}');
    END IF;
    SELECT id INTO tech_uid FROM auth.users WHERE email = 'tech@localmart.com';

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fashion@localmart.com') THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fashion@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Style Stacy"}');
    END IF;
    SELECT id INTO fashion_uid FROM auth.users WHERE email = 'fashion@localmart.com';

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'foodie@localmart.com') THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foodie@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Chef Chris"}');
    END IF;
    SELECT id INTO foodie_uid FROM auth.users WHERE email = 'foodie@localmart.com';

    -- =================================================================
    -- 2. CREATE SHOPS & PRODUCTS
    -- =================================================================

    -- 1. FRESH MART (Grocery)
    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Fresh Mart Supermarket', 'Your daily stop for fresh vegetables.', 'grocery', 'Shop 12, Market Rd, Mumbai', '9876543210', 19.0760, 72.8777, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', true, true, true, grocer_uid)
        RETURNING id INTO shop_id;

        INSERT INTO public.products (name, price, stock, category, image_url, description, user_id, seller_id) VALUES
        ('Fresh Tomatoes', 40, 100, 'grocery', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', 'Red tomatoes', grocer_uid, shop_id),
        ('Organic Bananas', 60, 50, 'grocery', 'https://images.unsplash.com/photo-1603833665858-e61d17a86271?w=800&q=80', 'Yellow bananas', grocer_uid, shop_id);
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 2. WELLNESS PHARMACY (Medical)
    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Wellness Pharmacy', '24/7 Pharmacy store.', 'medical', 'Shop 4, Main Rd, Mumbai', '9876510002', 19.0800, 72.8800, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80', true, true, true, pharma_uid)
        RETURNING id INTO shop_id;
        
        INSERT INTO public.products (name, price, stock, category, image_url, description, seller_id) VALUES
        ('Paracetamol', 30, 500, 'medical', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', 'Pain relief', shop_id);
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 3. TECH ZONE (Electronics)
    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Tech Zone', 'Latest gadgets.', 'electronics', 'Mall Rd, Mumbai', '9876510003', 19.0600, 72.8600, 'https://images.unsplash.com/photo-1531297461136-82lw9z3-w800?w=800&q=80', true, true, true, tech_uid)
        RETURNING id INTO shop_id;
        
        INSERT INTO public.products (name, price, stock, category, image_url, description, seller_id) VALUES
        ('USB-C Cable', 300, 100, 'electronics', 'https://images.unsplash.com/photo-1542125387-c71274d94f0a?w=800&q=80', 'Fast charging', shop_id);
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 4. STYLE HUB (Clothing)
    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Style Hub', 'Trendy fashion for all.', 'clothing', 'Fashion St, Mumbai', '9876510004', 19.0700, 72.8500, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', true, true, true, fashion_uid)
        RETURNING id INTO shop_id;

        INSERT INTO public.products (name, price, stock, category, image_url, description, seller_id) VALUES
        ('Cotton T-Shirt', 500, 200, 'clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'Comfortable cotton tee', shop_id);
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 5. SPICE DELIGHT (Food)
    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Spice Delight', 'Authentic Indian cuisine.', 'food', 'Food Court, Mumbai', '9876510005', 19.0900, 72.8900, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', true, true, true, foodie_uid)
        RETURNING id INTO shop_id;

         INSERT INTO public.products (name, price, stock, category, image_url, description, seller_id) VALUES
        ('Butter Chicken', 350, 50, 'food', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', 'Classic dish', shop_id);
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 6. GREEN VALLEY (Grocery - Duplicate Category test)
    -- NEED NEW USER
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'grocer2@localmart.com') THEN
         INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'grocer2@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Grocer Alice"}');
    END IF;
    
    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Green Valley Grocers', 'Organic and natural.', 'grocery', 'Green St, Mumbai', '9876510006', 19.0750, 72.8750, 'https://images.unsplash.com/photo-1604719312566-b7cb0727c622?w=800&q=80', true, true, true, (SELECT id FROM auth.users WHERE email = 'grocer2@localmart.com'))
        RETURNING id INTO shop_id;
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 7. CITY CHEMIST (Medical - Duplicate Category test)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pharma2@localmart.com') THEN
         INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pharma2@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Pharmacist Paul"}');
    END IF;

    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('City Chemist', 'Trusted medicines.', 'medical', 'City Center, Mumbai', '9876510007', 19.0850, 72.8850, 'https://images.unsplash.com/photo-1631549916768-4119b2d5f926?w=800&q=80', true, true, true, (SELECT id FROM auth.users WHERE email = 'pharma2@localmart.com'))
        RETURNING id INTO shop_id;
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 8. GADGET WORLD (Electronics)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tech2@localmart.com') THEN
         INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tech2@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Tech Tina"}');
    END IF;

    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Gadget World', 'All things tech.', 'electronics', 'Tech Park, Mumbai', '9876510008', 19.0650, 72.8650, 'https://images.unsplash.com/photo-1593305841991-05c29736ce37?w=800&q=80', true, true, true, (SELECT id FROM auth.users WHERE email = 'tech2@localmart.com'))
        RETURNING id INTO shop_id;
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 9. URBAN TRENDS (Clothing)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fashion2@localmart.com') THEN
         INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fashion2@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Designer Dan"}');
    END IF;

    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Urban Trends', 'Modern styles.', 'clothing', 'High St, Mumbai', '9876510009', 19.0720, 72.8520, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80', true, true, true, (SELECT id FROM auth.users WHERE email = 'fashion2@localmart.com'))
        RETURNING id INTO shop_id;
    EXCEPTION WHEN unique_violation THEN NULL; END;

    -- 10. BURGER JOINT (Food)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'foodie2@localmart.com') THEN
         INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foodie2@localmart.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"full_name": "Burger Bob"}');
    END IF;

    BEGIN
        INSERT INTO public.sellers (shop_name, shop_description, category, address, phone, latitude, longitude, image_url, is_approved, is_active, is_open, user_id)
        VALUES ('Burger Joint', 'Best burgers in town.', 'food', 'Food Alley, Mumbai', '9876510010', 19.0920, 72.8920, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', true, true, true, (SELECT id FROM auth.users WHERE email = 'foodie2@localmart.com'))
        RETURNING id INTO shop_id;
    EXCEPTION WHEN unique_violation THEN NULL; END;

END $$;
