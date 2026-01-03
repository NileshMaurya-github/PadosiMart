-- Create seller_credentials table for storing demo seller login info
CREATE TABLE public.seller_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  category text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_credentials ENABLE ROW LEVEL SECURITY;

-- Only admins can view credentials
CREATE POLICY "Only admins can view credentials"
ON public.seller_credentials
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage credentials
CREATE POLICY "Only admins can manage credentials"
ON public.seller_credentials
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));