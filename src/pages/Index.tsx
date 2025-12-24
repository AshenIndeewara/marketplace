import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CategoryGrid } from '@/components/items/CategoryGrid';
import { ItemCard } from '@/components/items/ItemCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { itemAPI } from '@/service/api';

const Index = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await itemAPI.getAll();
        const allItems = Array.isArray(response) ? response : response.data || [];
        const approvedItems = allItems.filter((item: any) => item.status === 'APPROVED').slice(0, 6);
        setItems(approvedItems);
      } catch (error) {
        console.error('Failed to fetch items');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Buy & Sell <span className="text-primary">Anything</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Sri Lanka's largest marketplace. Find great deals on vehicles, property, electronics and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 shadow-primary">
                <Link to="/auth?mode=register">
                  Start Selling
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/category/Vehicles">Browse Items</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </section>

      {/* Categories */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Browse Categories</h2>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Fresh Recommendations</h2>
            <Button asChild variant="ghost" className="gap-1">
              <Link to="/search">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted rounded-lg mb-2" />
                  <div className="h-4 bg-muted rounded w-20 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The trusted platform for buying and selling in Sri Lanka
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Safe & Secure</h3>
              <p className="text-sm text-muted-foreground">
                Verified sellers and secure transactions for peace of mind
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Quick & Easy</h3>
              <p className="text-sm text-muted-foreground">
                Post your ad in minutes and reach thousands of buyers
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Large Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with millions of buyers and sellers across Sri Lanka
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
