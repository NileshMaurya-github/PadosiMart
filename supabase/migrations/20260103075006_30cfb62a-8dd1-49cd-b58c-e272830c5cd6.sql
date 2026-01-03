-- Drop the existing public policy
DROP POLICY IF EXISTS "Approved sellers are viewable by everyone" ON public.sellers;

-- Create new policy that requires authentication to view approved sellers
CREATE POLICY "Approved sellers viewable by authenticated users"
ON public.sellers
FOR SELECT
USING (
  (is_approved = true AND is_active = true AND auth.uid() IS NOT NULL)
);
