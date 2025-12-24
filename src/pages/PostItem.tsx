import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { itemAPI, CATEGORIES } from '@/service/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';

const CONDITIONS = ['New', 'Like New', 'Used - Good', 'Used - Fair', 'For Parts'];

const PostItem = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    itemName: '',
    itemPrice: '',
    itemDescription: '',
    itemCategory: '',
    itemSubCategory: '',
    location: '',
    condition: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (isAdmin) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (name === 'itemCategory') {
      setFormData(prev => ({ ...prev, itemSubCategory: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      toast({ title: 'Error', description: 'Maximum 8 images allowed', variant: 'destructive' });
      return;
    }
    
    setImages([...images, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.itemPrice || !formData.itemCategory || !formData.itemSubCategory) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const form = new FormData();
      form.append('itemName', formData.itemName);
      form.append('itemPrice', formData.itemPrice);
      form.append('itemDescription', formData.itemDescription);
      form.append('itemCategory', formData.itemCategory);
      form.append('itemSubCategory', formData.itemSubCategory);
      form.append('location', formData.location);
      form.append('condition', formData.condition);
      
      images.forEach(image => {
        form.append('images', image);
      });

      const response = await itemAPI.add(form);
      
      if (response._id || response.data) {
        toast({ title: 'Success', description: 'Your ad has been posted!' });
        navigate('/dashboard');
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to post ad', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const subCategories = formData.itemCategory 
    ? CATEGORIES[formData.itemCategory as keyof typeof CATEGORIES] || []
    : [];

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Post Your Ad</h1>
          <p className="text-muted-foreground mt-1">Fill in the details to list your item</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-card border border-border rounded-xl p-6">
            <Label className="text-lg font-semibold mb-4 block">Photos</Label>
            <div className="grid grid-cols-4 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Add up to 8 photos. First photo will be the cover.</p>
          </div>

          {/* Details */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <Label className="text-lg font-semibold block">Details</Label>
            
            <div>
              <Label htmlFor="itemName">Title *</Label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="What are you selling?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.itemCategory} onValueChange={(v) => handleSelectChange('itemCategory', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sub Category *</Label>
                <Select 
                  value={formData.itemSubCategory} 
                  onValueChange={(v) => handleSelectChange('itemSubCategory', v)}
                  disabled={!formData.itemCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemPrice">Price (LKR) *</Label>
                <Input
                  id="itemPrice"
                  name="itemPrice"
                  type="number"
                  value={formData.itemPrice}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={formData.condition} onValueChange={(v) => handleSelectChange('condition', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((cond) => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Colombo"
              />
            </div>

            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                placeholder="Describe your item in detail..."
                rows={5}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Post Ad
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PostItem;
