import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { itemAPI, sellerAPI, getAuthToken } from '@/service/api';
import { ItemCard } from '@/components/items/ItemCard';
import { toast } from 'sonner';
import { ChevronRight, MapPin, Clock, Eye, Phone, Share2, Heart } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await itemAPI.getById(id!);
        setItem(response.data || response);
        console.log(response);
      } catch (error) {
        console.error('Failed to fetch item');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Fetch similar items when item loads
  useEffect(() => {
    const fetchSimilarItems = async () => {
      if (!item?.itemCategory) return;
      try {
        const response = await itemAPI.getByCategory(item.itemCategory);
        const items = response.data?.items || response.items || response.data || [];
        // Filter out the current item and limit to 4 items
        const filtered = items.filter((i: any) => i._id !== id).slice(0, 4);
        setSimilarItems(filtered);
      } catch (error) {
        console.error('Failed to fetch similar items');
      }
    };
    fetchSimilarItems();
  }, [item?.itemCategory, id]);

  // Check if item is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!getAuthToken() || !id) return;
      try {
        const response = await sellerAPI.getFavorites();
        const favorites = response.data || [];
        setIsFavorite(favorites.some((fav: any) => fav._id === id));
      } catch (error) {
        console.error('Failed to check favorites');
      }
    };
    checkFavorite();
  }, [id]);

  const handleFavorite = async () => {
    if (!getAuthToken()) {
      toast.error('Please login to add favorites');
      return;
    }
    setIsFavoriting(true);
    try {
      if (isFavorite) {
        await sellerAPI.removeFavorite(id!);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await sellerAPI.addFavorite(id!);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    } finally {
      setIsFavoriting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-xl" />
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded w-48" />
                <div className="h-8 bg-muted rounded w-full" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Item not found</h1>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/category/${item.itemCategory}`} className="hover:text-foreground transition-colors">
            {item.itemCategory}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground line-clamp-1">{item.itemName}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden">
              {item.itemImages?.[selectedImage] ? (
                <img
                  src={item.itemImages[selectedImage]}
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>

            {item.itemImages?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.itemImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {item.itemDescription?.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n') || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <p className="text-3xl font-bold text-primary">{formatPrice(item.itemPrice)}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleFavorite}
                    disabled={isFavoriting}
                    className={isFavorite ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-xl font-semibold text-foreground mb-4">{item.itemName}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {item.condition && (
                  <Badge variant="outline">{item.condition}</Badge>
                )}
                <Badge variant="outline">{item.itemCategory}</Badge>
                {item.itemSubCategory && (
                  <Badge variant="outline">{item.itemSubCategory}</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                {item.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                )}
                {item.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Posted on {formatDate(item.createdAt)}</span>
                  </div>
                )}
                {item.views !== undefined && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{item.views} views</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {!showPhone ? (
                  <Button className="w-full gap-2" size="lg" onClick={() => setShowPhone(true)}>
                    <Phone className="h-4 w-4" />
                    Show Phone Number
                  </Button>
                ) : (
                  <a href={`tel:${item.sellerId?.phone || item.sellerPhone || item.seller?.phone}`} className="block w-full">
                    <Button variant="secondary" className="w-full gap-2" size="lg">
                      <Phone className="h-4 w-4" />
                      {item.sellerId?.phone || item.sellerPhone || item.seller?.phone || 'No phone available'}
                    </Button>
                  </a>
                )}
                <a 
                  href={`https://wa.me/${(item.sellerId?.phone || item.sellerPhone || item.seller?.phone || '').replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full gap-2 text-green-600 border-green-600 hover:bg-green-50" size="lg">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-accent/50 border border-accent rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-2">Safety Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Meet in a safe, public place</li>
                <li>• Check the item before you buy</li>
                <li>• Pay only after collecting the item</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarItems.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Similar Items in {item.itemCategory}</h2>
              <Link 
                to={`/category/${item.itemCategory}`} 
                className="text-primary hover:underline text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.map((similarItem) => (
                <ItemCard key={similarItem._id} item={similarItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ItemDetail;
