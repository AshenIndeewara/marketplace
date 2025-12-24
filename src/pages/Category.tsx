import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ItemCard } from '@/components/items/ItemCard';
import { Button } from '@/components/ui/button';
import { CATEGORIES, itemAPI } from '@/service/api';
import { ChevronRight } from 'lucide-react';

const Category = () => {
  const { category, subCategory } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<string | null>(subCategory || null);
  const [isLoading, setIsLoading] = useState(true);

  const subCategories = category ? CATEGORIES[category as keyof typeof CATEGORIES] || [] : [];

  useEffect(() => {
    const fetchItems = async () => {
      if (!category) return;
      setIsLoading(true);
      try {
        let response;
        if (selectedSub) {
          response = await itemAPI.getByCategory(category, selectedSub);
        } else {
          // Fetch all items and filter by category client-side
          response = await itemAPI.getAll();
          const allItems = Array.isArray(response) ? response : response.data || [];
          const filtered = allItems.filter((item: any) => 
            item.itemCategory === category && item.status === 'APPROVED'
          );
          setItems(filtered);
          setIsLoading(false);
          return;
        }
        const data = Array.isArray(response) ? response : response.data || [];
        // Only show approved items
        const approvedItems = data.filter((item: any) => item.status === 'APPROVED');
        setItems(approvedItems);
      } catch (error) {
        console.error('Failed to fetch items');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [category, selectedSub]);

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{category}</span>
          {selectedSub && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{selectedSub}</span>
            </>
          )}
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
              <h3 className="font-semibold text-foreground mb-3">{category}</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedSub(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedSub ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    All in {category}
                  </button>
                </li>
                {subCategories.map((sub) => (
                  <li key={sub}>
                    <button
                      onClick={() => setSelectedSub(sub)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedSub === sub ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {selectedSub || category}
              </h1>
              <p className="text-muted-foreground">{items.length} ads</p>
            </div>

            {/* Mobile subcategories */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:hidden">
              <Button
                variant={!selectedSub ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSub(null)}
              >
                All
              </Button>
              {subCategories.map((sub) => (
                <Button
                  key={sub}
                  variant={selectedSub === sub ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSub(sub)}
                  className="whitespace-nowrap"
                >
                  {sub}
                </Button>
              ))}
            </div>

            {/* Items Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-lg mb-2" />
                    <div className="h-4 bg-muted rounded w-20 mb-2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No items found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Category;
