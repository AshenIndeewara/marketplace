import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';

interface Item {
  _id: string;
  itemName: string;
  itemPrice: number;
  itemImages: string[];
  itemCategory: string;
  location?: string;
  condition?: string;
  status?: string;
  createdAt?: string;
}

export const ItemCard = ({ item }: { item: Item }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
  };

  return (
    <Link
      to={`/item/${item._id}`}
      className="group block bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        {item.itemImages?.[0] ? (
          <img
            src={item.itemImages[0]}
            alt={item.itemName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {item.status === 'SOLD' && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-1">SOLD</Badge>
          </div>
        )}
        {item.condition && (
          <Badge className="absolute top-2 left-2 bg-card/90 text-foreground text-xs">
            {item.condition}
          </Badge>
        )}
      </div>

      <div className="p-3">
        <p className="font-bold text-lg text-primary mb-1">{formatPrice(item.itemPrice)}</p>
        <h3 className="font-medium text-foreground line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors">
          {item.itemName}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
          )}
          {item.createdAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(item.createdAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
