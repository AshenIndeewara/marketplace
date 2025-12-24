import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { sellerAPI } from '@/service/api';
import { Heart, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await sellerAPI.getFavorites();
        setFavorites(response.data || []);
      } catch (error) {
        console.error('Failed to fetch favorites');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await sellerAPI.removeFavorite(itemId);
      setFavorites(prev => prev.filter(item => item._id !== itemId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">My Favorites</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
          {favorites.length > 0 && (
            <span className="text-muted-foreground">({favorites.length} items)</span>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">Start adding items to your favorites to see them here.</p>
            <Button asChild>
              <Link to="/">Browse Items</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((item) => (
              <div key={item._id} className="relative group">
                <Link to={`/item/${item._id}`}>
                  <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted">
                      {item.itemImages?.[0] ? (
                        <img
                          src={item.itemImages[0]}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-primary">{formatPrice(item.itemPrice)}</p>
                      <h3 className="text-sm font-medium text-foreground line-clamp-2 mt-1">
                        {item.itemName}
                      </h3>
                      {item.location && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(item._id)}
                  disabled={removingId === item._id}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;