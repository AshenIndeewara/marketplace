import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PostItem from "./pages/PostItem";
import EditItem from "./pages/EditItem";
import Admin from "./pages/Admin";
import Category from "./pages/Category";
import ItemDetail from "./pages/ItemDetail";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/post" element={<PostItem />} />
            <Route path="/dashboard/edit/:id" element={<EditItem />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/category/:category" element={<Category />} />
            <Route path="/category/:category/:subCategory" element={<Category />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
