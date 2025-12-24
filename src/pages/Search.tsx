import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ItemCard } from '@/components/items/ItemCard';
import { Badge } from '@/components/ui/badge';
import { itemAPI, askAPI } from '@/service/api';
import { X, Sparkles } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = 20;

  const query = searchParams.get('q');
  const subCategory = searchParams.get('subCategory');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const isAiSearch = searchParams.get('ai') === 'true';
  const hasActiveFilters = subCategory || minPrice || maxPrice || isAiSearch;

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const page = parseInt(searchParams.get('page') || '1');
      const subCat = searchParams.get('subCategory') || undefined;
      const min = searchParams.get('minPrice');
      const max = searchParams.get('maxPrice');
      const q = searchParams.get('q');
      const useAi = searchParams.get('ai') === 'true';

      let response;
      if (q && useAi) {
        // AI-powered search
        const aiResponse = await askAPI.search(q);
        response = { data: aiResponse.results || [], total: aiResponse.results?.length || 0 };
      } else if (q) {
        response = await itemAPI.search(q);
      } else {
        response = await itemAPI.getAll({
          page,
          limit: itemsPerPage,
          subCategory: subCat,
          minPrice: min ? parseInt(min) : undefined,
          maxPrice: max ? parseInt(max) : undefined,
        });
      }
      
      const data = Array.isArray(response) ? response : response.data || [];
      setItems(data);
      setTotalItems(response.total || data.length);
    } catch (error) {
      console.error('Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    if (key === 'category') params.delete('subCategory');
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <Layout>
      <div className="container py-8">
        {/* Results Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              {isAiSearch && <Sparkles className="h-5 w-5 text-primary" />}
              {query ? `Results for "${query}"` : 'All Items'}
            </h1>
            <p className="text-muted-foreground">{totalItems} items found</p>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {isAiSearch && (
                <Badge variant="default" className="gap-1 pr-1">
                  <Sparkles className="h-3 w-3" />
                  AI Search
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter('ai')} />
                </Badge>
              )}
              {subCategory && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {subCategory}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter('subCategory')} />
                </Badge>
              )}
              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Rs. {minPrice || '0'} - {maxPrice || '∞'}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
                    removeFilter('minPrice');
                    removeFilter('maxPrice');
                  }} />
                </Badge>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-lg mb-2" />
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No items found</p>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <div key={item._id} className="relative">
                  <ItemCard item={item} />
                  {isAiSearch && item.score && (
                    <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {Math.round(item.score * 100)}% match
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) pageNum = currentPage - 2 + i;
                      if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
