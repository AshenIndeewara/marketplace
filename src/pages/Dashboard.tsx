import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { sellerAPI, itemAPI } from '@/service/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    fetchMyItems();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchMyItems = async () => {
    try {
      const response = await sellerAPI.getMyItems();
      setItems(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch items', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await itemAPI.delete(id);
      toast({ title: 'Success', description: 'Item deleted successfully' });
      fetchMyItems();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      await itemAPI.markSold(id);
      toast({ title: 'Success', description: 'Item marked as sold' });
      fetchMyItems();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-warning/10 text-warning border-warning/20',
      APPROVED: 'bg-success/10 text-success border-success/20',
      REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
      SOLD: 'bg-muted text-muted-foreground border-muted',
    };
    return <Badge variant="outline" className={styles[status] || ''}>{status}</Badge>;
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your listings</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/dashboard/post">
              <Plus className="h-4 w-4" />
              Post New Ad
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
                <p className="text-sm text-muted-foreground">Total Ads</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {items.filter(i => i.status === 'APPROVED').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {items.filter(i => i.status === 'PENDING').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {items.filter(i => i.status === 'SOLD').length}
                </p>
                <p className="text-sm text-muted-foreground">Sold</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No items yet</p>
                    <Button asChild size="sm">
                      <Link to="/dashboard/post">Post your first ad</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                          {item.itemImages?.[0] ? (
                            <img src={item.itemImages[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No img
                            </div>
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">{item.itemName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.itemCategory}</TableCell>
                    <TableCell className="font-medium">{formatPrice(item.itemPrice)}</TableCell>
                    <TableCell>{getStatusBadge(item.status || 'PENDING')}</TableCell>
                    <TableCell className="text-muted-foreground">{item.views || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/item/${item._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/dashboard/edit/${item._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {item.status !== 'SOLD' && (
                          <Button variant="ghost" size="icon" onClick={() => handleMarkSold(item._id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your listing.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item._id)} className="bg-destructive text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
