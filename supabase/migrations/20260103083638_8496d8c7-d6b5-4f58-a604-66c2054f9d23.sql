-- Make avatars bucket private to protect user profile photos
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';

-- Keep shop-images and product-images public (marketplace content needs to be viewable by everyone)