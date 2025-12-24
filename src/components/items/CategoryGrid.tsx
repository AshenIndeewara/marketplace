import { Link } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ICONS } from '@/service/api';
import { Car, Home, Smartphone, Sofa, Shirt, Dog, Dumbbell, Briefcase, GraduationCap, Leaf } from 'lucide-react';

const CATEGORY_LUCIDE_ICONS: Record<string, React.ElementType> = {
  Vehicles: Car,
  Property: Home,
  Electronics: Smartphone,
  'Home & Garden': Sofa,
  'Fashion & Beauty': Shirt,
  Animals: Dog,
  'Hobby, Sport & Kids': Dumbbell,
  'Business & Industry': Briefcase,
  Education: GraduationCap,
  Agriculture: Leaf,
};

export const CategoryGrid = () => {
  const categories = Object.keys(CATEGORIES);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {categories.map((category) => {
        const Icon = CATEGORY_LUCIDE_ICONS[category];
        return (
          <Link
            key={category}
            to={`/category/${encodeURIComponent(category)}`}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary hover:shadow-card-hover hover:bg-accent"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
              {Icon && <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />}
            </div>
            <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
              {category}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
