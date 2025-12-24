import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, itemAPI } from '@/service/api';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Users, Package, ShieldCheck, ShieldOff, Trash2, Eye } from 'lucide-react';
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

const Admin = () => {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard');
      toast({ title: 'Access Denied', description: 'Admin access required', variant: 'destructive' });
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [itemsRes, usersRes] = await Promise.all([
        adminAPI.getAllItems(),
        adminAPI.getAllUsers(),
      ]);
      setItems(Array.isArray(itemsRes) ? itemsRes : itemsRes.data || []);
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await itemAPI.approve(id);
      toast({ title: 'Success', description: 'Item approved' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve item', variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await itemAPI.reject(id);
      toast({ title: 'Success', description: 'Item rejected' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject item', variant: 'destructive' });
    }
  };

  const handleMakeAdmin = async (id: string) => {
    try {
      await adminAPI.makeAdmin(id);
      toast({ title: 'Success', description: 'User promoted to admin' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to promote user', variant: 'destructive' });
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    try {
      await adminAPI.removeAdmin(id);
      toast({ title: 'Success', description: 'Admin role removed' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove admin', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await adminAPI.deleteUser(id);
      toast({ title: 'Success', description: 'User deleted' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
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

  const pendingItems = items.filter(i => i.status === 'PENDING');

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage items and users</p>
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
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingItems.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.roles?.includes('ADMIN')).length}
                </p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending Items
              {pendingItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all-items">All Items</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : pendingItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No pending items
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingItems.map((item) => (
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
                        <TableCell className="text-muted-foreground">{item.sellerId}</TableCell>
                        <TableCell className="text-muted-foreground">{item.itemCategory}</TableCell>
                        <TableCell className="font-medium">{formatPrice(item.itemPrice)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/item/${item._id}`)} className="text-muted-foreground hover:text-foreground">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(item._id)} className="text-success hover:text-success">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReject(item._id)} className="text-destructive hover:text-destructive">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="all-items">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/item/${item._id}`)} className="text-muted-foreground hover:text-foreground">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === 'PENDING' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleApprove(item._id)} className="text-success hover:text-success">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleReject(item._id)} className="text-destructive hover:text-destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.firstname} {user.lastname}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles?.map((role: string) => (
                            <Badge key={role} variant="outline" className={
                              role === 'SUPER_ADMIN' ? 'bg-primary/10 text-primary border-primary/20' :
                              role === 'ADMIN' ? 'bg-success/10 text-success border-success/20' :
                              'bg-muted'
                            }>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isSuperAdmin && !user.roles?.includes('SUPER_ADMIN') && (
                            user.roles?.includes('ADMIN') ? (
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveAdmin(user._id)} className="text-destructive">
                                <ShieldOff className="h-4 w-4 mr-1" />
                                Remove Admin
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => handleMakeAdmin(user._id)} className="text-success">
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Make Admin
                              </Button>
                            )
                          )}
                          {!user.roles?.includes('SUPER_ADMIN') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user and all their data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user._id)} className="bg-destructive text-destructive-foreground">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
