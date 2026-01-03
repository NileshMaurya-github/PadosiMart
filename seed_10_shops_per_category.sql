
-- Seed script to create 10 shops per category with unique dummy users

DO $$
DECLARE
    v_user_id UUID;
    v_category text;
    v_shop_name text;
    v_shop_id uuid;
    i integer;
    j integer;
    categories text[] := ARRAY['grocery', 'medical', 'electronics', 'clothing', 'food', 'services'];
    shop_suffixes text[] := ARRAY['Express', 'Point', 'Hub', 'Corner', 'World', 'Zone', 'Plaza', 'Store', 'Emporium', 'Outlet'];
    shop_prefixes text[] := ARRAY['Super', 'City', 'Urban', 'Metro', 'Royal', 'Elite', 'Prime', 'Daily', 'Quick', 'Smart'];
BEGIN
    -- Loop through each category
    FOREACH v_category IN ARRAY categories
    LOOP
        -- Create 10 shops for each category
        FOR i IN 1..10 LOOP
            -- 1. Create a dummy user for this shop
            -- We construct a unique email
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                recovery_sent_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                'demo_' || v_category || '_' || i || '@example.com',
                '$2a$10$abcdefg123456...', -- Dummy hash, login not intended
                now(),
                NULL,
                now(),
                '{"provider": "email", "providers": ["email"]}',
                json_build_object('full_name', 'Owner of ' || initcap(v_category) || ' Shop ' || i),
                now(),
                now(),
                '',
                '',
                '',
                ''
            ) RETURNING id INTO v_user_id;

            -- 2. Create the Seller/Shop
            v_shop_name := shop_prefixes[i] || ' ' || initcap(v_category) || ' ' || shop_suffixes[i];
            
            INSERT INTO public.sellers (
                user_id,
                shop_name,
                shop_description,
                category,
                address,
                phone,
                is_active,
                is_approved,
                opening_hours,
                closing_hours,
                rating,
                review_count,
                latitude,
                longitude,
                image_url,
                delivery_options
            ) VALUES (
                v_user_id,
                v_shop_name,
                'Best ' || v_category || ' shop in the area. providing quality items.',
                v_category::shop_category,
                'Shop ' || i || ', Sector ' || (i*2) || ', Demo City',
                '+91 98765 ' || lpad(i::text, 5, '0'),
                true,
                true,
                '09:00',
                '22:00',
                4.0 + (random() * 1.0), -- Random rating between 4.0 and 5.0
                floor(random() * 500) + 50, -- Random review count
                28.6139 + (random() * 0.1) - 0.05, -- Random lat around Delhi
                77.2090 + (random() * 0.1) - 0.05, -- Random lng around Delhi
                CASE 
                    WHEN v_category = 'grocery' THEN 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=600'
                    WHEN v_category = 'medical' THEN 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600'
                    WHEN v_category = 'electronics' THEN 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600'
                    WHEN v_category = 'clothing' THEN 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=600'
                    WHEN v_category = 'food' THEN 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'
                    ELSE 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=600'
                END,
                ARRAY['self_delivery', 'customer_pickup']::delivery_type[]
            ) RETURNING id INTO v_shop_id;

            -- 3. Add 5 Products for each shop
            FOR j IN 1..5 LOOP
                INSERT INTO public.products (
                    seller_id,
                    name,
                    description,
                    price,
                    image_url,
                    category,
                    stock,
                    is_available
                ) VALUES (
                    v_shop_id,
                    initcap(v_category) || ' Product ' || j,
                    'High quality ' || v_category || ' item.',
                    floor(random() * 1000) + 100,
                    CASE 
                        WHEN v_category = 'grocery' THEN 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600'
                        WHEN v_category = 'medical' THEN 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=600'
                        WHEN v_category = 'electronics' THEN 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=600'
                        WHEN v_category = 'clothing' THEN 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600'
                        WHEN v_category = 'food' THEN 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=600'
                        ELSE 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=600'
                    END,
                    v_category,
                    100,
                    true
                );
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Added 10 shops each with a unique dummy user and 50 products per category.';
END $$;
