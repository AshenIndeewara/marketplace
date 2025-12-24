import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { itemAPI, CATEGORIES } from '@/service/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';

const CONDITIONS = ['New', 'Like New', 'Used - Good', 'Used - Fair', 'For Parts'];

const EditItem = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    itemName: '',
    itemPrice: '',
    itemDescription: '',
    itemCategory: '',
    itemSubCategory: '',
    location: '',
    condition: '',
  });
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchItem();
  }, [isAuthenticated, navigate, id]);

  const fetchItem = async () => {
    if (!id) return;
    try {
      const response = await itemAPI.getById(id);
      const item = response.data || response;
      setFormData({
        itemName: item.itemName || '',
        itemPrice: item.itemPrice?.toString() || '',
        itemDescription: item.itemDescription || '',
        itemCategory: item.itemCategory || '',
        itemSubCategory: item.itemSubCategory || '',
        location: item.location || '',
        condition: item.condition || '',
      });
      setExistingImages(item.itemImages || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch item', variant: 'destructive' });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages > 5) {
      toast({ title: 'Error', description: 'Maximum 5 images allowed', variant: 'destructive' });
      return;
    }
    
    setNewImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    if (!formData.itemName || !formData.itemPrice || !formData.itemCategory || !formData.itemSubCategory) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('itemName', formData.itemName);
      submitData.append('itemPrice', formData.itemPrice);
      submitData.append('itemDescription', formData.itemDescription);
      submitData.append('itemCategory', formData.itemCategory);
      submitData.append('itemSubCategory', formData.itemSubCategory);
      submitData.append('location', formData.location);
      submitData.append('condition', formData.condition);
      submitData.append('existingImages', JSON.stringify(existingImages));
      
      newImages.forEach(image => {
        submitData.append('images', image);
      });

      await itemAPI.update(id, submitData);
      toast({ title: 'Success', description: 'Item updated successfully' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subCategories = formData.itemCategory 
    ? CATEGORIES[formData.itemCategory as keyof typeof CATEGORIES] || []
    : [];

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Edit Item</h1>
          <p className="text-muted-foreground mt-1">Update your listing details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="space-y-3">
            <Label>Images (max 5)</Label>
            <div className="grid grid-cols-5 gap-3">
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {existingImages.length + newImages.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.itemName}
              onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
              placeholder="What are you selling?"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.itemCategory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, itemCategory: value, itemSubCategory: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CATEGORIES).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory *</Label>
              <Select
                value={formData.itemSubCategory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, itemSubCategory: value }))}
                disabled={!formData.itemCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (LKR) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.itemPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, itemPrice: e.target.value }))}
              placeholder="0"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map(cond => (
                  <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Colombo"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.itemDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, itemDescription: e.target.value }))}
              placeholder="Describe your item..."
              rows={5}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Item'
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default EditItem;
