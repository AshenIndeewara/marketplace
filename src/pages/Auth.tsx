import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/service/api';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(2, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstname: z.string().min(2, 'First name must be at least 2 characters'),
  lastname: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    phone: '',
  });

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (isRegister) {
        const result = registerSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const response = await authAPI.register(formData);
        if (response._id || response.data) {
          toast({ title: 'Success', description: 'Account created! Please login.' });
          setIsRegister(false);
        } else {
          toast({ title: 'Error', description: response.message || 'Registration failed', variant: 'destructive' });
        }
      } else {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const loginResult = await login(formData.email, formData.password);
        if (loginResult.success) {
          toast({ title: 'Welcome back!', description: 'Login successful' });
          navigate('/dashboard');
        } else {
          toast({ title: 'Error', description: loginResult.error || 'Login failed', variant: 'destructive' });
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card animate-scale-in">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <span className="font-display text-xl font-bold text-primary-foreground">M</span>
                </div>
              </Link>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isRegister ? 'Start buying and selling today' : 'Login to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstname">First Name</Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      className={errors.firstname ? 'border-destructive' : ''}
                    />
                    {errors.firstname && <p className="text-xs text-destructive mt-1">{errors.firstname}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      className={errors.lastname ? 'border-destructive' : ''}
                    />
                    {errors.lastname && <p className="text-xs text-destructive mt-1">{errors.lastname}</p>}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              {isRegister && (
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isRegister ? 'Create Account' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary font-medium hover:underline"
              >
                {isRegister ? 'Login' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
