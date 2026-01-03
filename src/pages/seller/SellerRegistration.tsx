import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/marketplace/Navbar";
import { LocationPrompt } from "@/components/marketplace/LocationPrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, MapPin, Phone, FileText, Loader2, CheckCircle2, Upload, ImageIcon, X } from "lucide-react";

const shopCategories = [
  { value: "grocery", label: "Grocery & Essentials" },
  { value: "medical", label: "Medical & Pharmacy" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Fashion" },
  { value: "food", label: "Food & Restaurant" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
] as const;

const deliveryOptions = [
  { value: "self_delivery", label: "Self Delivery" },
  { value: "third_party", label: "Third Party Delivery" },
  { value: "customer_pickup", label: "Customer Pickup" },
] as const;

const sellerRegistrationSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters").max(100),
  shopDescription: z.string().max(500).optional(),
  category: z.enum(["grocery", "medical", "electronics", "clothing", "food", "services", "other"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  address: z.string().min(10, "Please provide a complete address").max(300),
  openingHours: z.string().optional(),
  closingHours: z.string().optional(),
  deliveryOptions: z.array(z.enum(["self_delivery", "third_party", "customer_pickup"])).min(1, "Select at least one delivery option"),
});

type SellerRegistrationFormData = z.infer<typeof sellerRegistrationSchema>;

export default function SellerRegistration() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, userRole } = useAuth();
  const { toast } = useToast();
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSeller, setExistingSeller] = useState<boolean | null>(null);
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SellerRegistrationFormData>({
    resolver: zodResolver(sellerRegistrationSchema),
    defaultValues: {
      shopName: "",
      shopDescription: "",
      category: "other",
      phone: "",
      address: "",
      openingHours: "09:00",
      closingHours: "21:00",
      deliveryOptions: ["customer_pickup"],
    },
  });

  // Check if user is already a seller
  useEffect(() => {
    const checkExistingSeller = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setExistingSeller(true);
        navigate("/seller");
      } else {
        setExistingSeller(false);
      }
    };

    checkExistingSeller();
  }, [user, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { returnTo: "/seller/register" } });
    }
  }, [authLoading, user, navigate]);

  const handleEnableLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
        toast({
          title: "Location captured",
          description: "Your shop location has been set successfully.",
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setShopImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setShopImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadShopImage = async (userId: string): Promise<string | null> => {
    if (!shopImage) return null;

    setImageUploading(true);
    try {
      const fileExt = shopImage.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("shop-images")
        .upload(fileName, shopImage, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("shop-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (data: SellerRegistrationFormData) => {
    if (!user || !location) return;

    setIsSubmitting(true);

    try {
      // Upload shop image if provided
      let imageUrl: string | null = null;
      if (shopImage) {
        imageUrl = await uploadShopImage(user.id);
      }

      // Insert seller record
      const { error: sellerError } = await supabase.from("sellers").insert({
        user_id: user.id,
        shop_name: data.shopName,
        shop_description: data.shopDescription || null,
        category: data.category,
        phone: data.phone,
        address: data.address,
        latitude: location.lat,
        longitude: location.lng,
        opening_hours: data.openingHours || null,
        closing_hours: data.closingHours || null,
        delivery_options: data.deliveryOptions,
        image_url: imageUrl,
        is_approved: false,
        is_active: true,
        is_open: true,
      });

      if (sellerError) throw sellerError;

      // Update user role to seller
      const { error: roleError } = await supabase.from("user_roles").upsert({
        user_id: user.id,
        role: "seller",
      }, {
        onConflict: "user_id",
      });

      if (roleError) throw roleError;

      toast({
        title: "Registration submitted!",
        description: "Your seller application is pending approval. We'll notify you once approved.",
      });

      // Refresh page to update role
      window.location.href = "/seller";
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Check for duplicate key error
      let errorMessage = "Something went wrong. Please try again.";
      if (error.message?.includes("duplicate key") || error.code === "23505") {
        errorMessage = "You already have a seller account. Please go to your seller dashboard.";
        setTimeout(() => navigate("/seller"), 2000);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || existingSeller === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show location prompt if no location captured yet
  if (!location) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-lg mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Become a Seller</h1>
            <p className="text-muted-foreground">
              Start selling your products to customers in your neighborhood
            </p>
          </div>
          <LocationPrompt
            onEnableLocation={handleEnableLocation}
            isLoading={locationLoading}
            error={locationError || undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Register Your Shop</h1>
          <p className="text-muted-foreground">
            Complete the form below to start selling on our platform
          </p>
        </div>

        {/* Location Captured Badge */}
        <Card variant="glass" className="mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Location Captured</p>
              <p className="text-sm text-muted-foreground">
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Shop Details
            </CardTitle>
            <CardDescription>
              Provide accurate information about your shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Shop Image Upload */}
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Shop Image
                  </FormLabel>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imagePreview}
                          alt="Shop preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 bg-secondary/30"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Click to upload</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                  <FormDescription>
                    Add a photo of your shop storefront (optional but recommended)
                  </FormDescription>
                </FormItem>

                {/* Shop Name */}
                <FormField
                  control={form.control}
                  name="shopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Green Valley Grocers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your shop category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shopCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="shopDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your shop, products, and what makes you special..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional but helps customers understand your offerings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 9876543210" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Full Address *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Shop No., Building, Street, Area, City, Pincode"
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Operating Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Delivery Options */}
                <FormField
                  control={form.control}
                  name="deliveryOptions"
                  render={() => (
                    <FormItem>
                      <FormLabel>Delivery Options *</FormLabel>
                      <FormDescription>
                        Select all delivery methods you support
                      </FormDescription>
                      <div className="space-y-3 mt-2">
                        {deliveryOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="deliveryOptions"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValue, option.value]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter((v) => v !== option.value)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || imageUploading}
                >
                  {isSubmitting || imageUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {imageUploading ? "Uploading image..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Store className="w-5 h-5 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  By registering, you agree to our seller terms and commission policy
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
