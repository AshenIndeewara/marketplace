import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, User, LogOut, LayoutDashboard, ShieldCheck, SlidersHorizontal, X, Heart, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/service/api';

export const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAiSearch, setIsAiSearch] = useState(searchParams.get('ai') === 'true');

  const subCategories = selectedCategory ? CATEGORIES[selectedCategory as keyof typeof CATEGORIES] || [] : [];
  const hasActiveFilters = selectedSubCategory || minPrice || maxPrice;

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSubCategory(searchParams.get('subCategory') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setIsAiSearch(searchParams.get('ai') === 'true');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithFilters();
  };

  const navigateWithFilters = () => {
    const params: Record<string, string> = { page: '1' };
    if (searchQuery.trim()) params.q = searchQuery;
    if (isAiSearch) params.ai = 'true';
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSubCategory) params.subCategory = selectedSubCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    
    const queryString = new URLSearchParams(params).toString();
    navigate(`/search?${queryString}`);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">Marketplace</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex gap-2">
          <div className="relative flex-1">
            {isAiSearch ? (
              <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            ) : (
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              type="search"
              placeholder={isAiSearch ? "AI-powered search..." : "Search for items..."}
              className={`w-full pl-10 border-0 ${isAiSearch ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            type="button"
            variant={isAiSearch ? "default" : "outline"}
            size="icon"
            className="shrink-0"
            onClick={() => setIsAiSearch(!isAiSearch)}
            title={isAiSearch ? "Switch to normal search" : "Switch to AI search"}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="icon" className="relative shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-popover" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filters</h4>
                
                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select value={selectedCategory} onValueChange={(val) => {
                    setSelectedCategory(val);
                    setSelectedSubCategory('');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {Object.keys(CATEGORIES).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Category */}
                {subCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Sub Category</Label>
                    <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All sub categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {subCategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range */}
                <div className="space-y-2">
                  <Label className="text-sm">Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button type="button" onClick={navigateWithFilters} size="sm" className="flex-1">
                    Apply
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button type="submit" size="icon" className="shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Button asChild variant="default" size="sm" className="gap-2">
                  <Link to="/dashboard/post">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Post Ad</span>
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.roles?.join(', ')}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {!isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/favorites" className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          My Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/auth?mode=register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
