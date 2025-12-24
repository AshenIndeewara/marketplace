const API_BASE_URL = 'http://localhost:5000/api/v1';

// Auth helpers
export const getAuthToken = () => localStorage.getItem('accessToken');
export const setAuthToken = (token: string) => localStorage.setItem('accessToken', token);
export const removeAuthToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const setUser = (user: any) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const headers = (withAuth = false) => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (withAuth) {
    const token = getAuthToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

// Auth API
export const authAPI = {
  register: async (data: { email: string; firstname: string; lastname: string; password: string; phone: string }) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.data?.accessToken) {
      setAuthToken(data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser({ email: data.data.email, roles: data.data.roles });
    }
    return data;
  },

  logout: () => {
    removeAuthToken();
  },
};

// Item API
export const askAPI = {
  search: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/ask/search`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('AI search failed');
    return response.json();
  },
};

export const itemAPI = {
  getAll: async (filters?: { page?: number; limit?: number; subCategory?: string; minPrice?: number; maxPrice?: number }) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.subCategory) params.append('subCategory', filters.subCategory);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    
    const queryString = params.toString();
    const res = await fetch(`${API_BASE_URL}/item/all${queryString ? `?${queryString}` : ''}`, { headers: headers(true) });
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/item/${id}`, { headers: headers(true) });
    return res.json();
  },

  search: async (q: string) => {
    const res = await fetch(`${API_BASE_URL}/item?q=${encodeURIComponent(q)}`, { headers: headers(true) });
    return res.json();
  },

  getByCategory: async (category: string, subCategory?: string) => {
    const url = subCategory 
      ? `${API_BASE_URL}/item/${encodeURIComponent(category)}/${encodeURIComponent(subCategory)}`
      : `${API_BASE_URL}/item/all?category=${encodeURIComponent(category)}`;
    const res = await fetch(url, { headers: headers(true) });
    return res.json();
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/item/categories`);
    return res.json();
  },

  add: async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/item/add`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return res.json();
  },

  update: async (id: string, formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/item/update/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/item/delete/${id}`, {
      method: 'DELETE',
      headers: headers(true),
    });
    return res.json();
  },

  approve: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/item/approve/${id}`, {
      method: 'PUT',
      headers: headers(true),
    });
    return res.json();
  },

  reject: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/item/reject/${id}`, {
      method: 'PUT',
      headers: headers(true),
    });
    return res.json();
  },

  markSold: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/item/sold/${id}`, {
      method: 'PUT',
      headers: headers(true),
    });
    return res.json();
  },
};

// Seller API
export const sellerAPI = {
  getMyItems: async () => {
    const res = await fetch(`${API_BASE_URL}/seller/my-items`, {
      headers: headers(true),
    });
    return res.json();
  },

  addFavorite: async (itemId: string) => {
    const res = await fetch(`${API_BASE_URL}/seller/favorite-item/${itemId}`, {
      method: 'POST',
      headers: headers(true),
    });
    return res.json();
  },

  getFavorites: async () => {
    const res = await fetch(`${API_BASE_URL}/seller/favorite-items`, {
      headers: headers(true),
    });
    return res.json();
  },

  removeFavorite: async (itemId: string) => {
    const res = await fetch(`${API_BASE_URL}/seller/favorite-item/${itemId}`, {
      method: 'DELETE',
      headers: headers(true),
    });
    return res.json();
  },
};

// Admin API
export const adminAPI = {
  getAllItems: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/items`, {
      headers: headers(true),
    });
    return res.json();
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: headers(true),
    });
    return res.json();
  },

  makeAdmin: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/make-admin/${id}`, {
      method: 'PUT',
      headers: headers(true),
    });
    return res.json();
  },

  removeAdmin: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/remove-admin/${id}`, {
      method: 'PUT',
      headers: headers(true),
    });
    return res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/delete-user/${id}`, {
      method: 'DELETE',
      headers: headers(true),
    });
    return res.json();
  },
};

// Categories data
export const CATEGORIES = {
  Vehicles: ['Cars', 'Motorbikes', 'Three Wheelers', 'Bicycles', 'Vans', 'Buses & Lorries', 'Heavy Machinery', 'Auto Parts'],
  Property: ['Land', 'Houses For Sale', 'House Rentals', 'Apartments', 'Commercial Property'],
  Electronics: ['Mobile Phones', 'Computers & Tablets', 'TVs', 'Cameras', 'Audio & MP3', 'Video Games'],
  'Home & Garden': ['Furniture', 'Home Appliances', 'Garden', 'Home Decor', 'Kitchen Items'],
  'Fashion & Beauty': ['Clothing', 'Shoes', 'Jewelry', 'Watches', 'Beauty Products'],
  Animals: ['Pets', 'Pet Food', 'Farm Animals'],
  'Hobby, Sport & Kids': ['Musical Instruments', 'Sports & Fitness', 'Children\'s Items', 'Books'],
  'Business & Industry': ['Services', 'Equipment', 'Office Supplies'],
  Education: ['Higher Education', 'Textbooks', 'Tuition'],
  Agriculture: ['Food', 'Crops', 'Seeds & Plants'],
};

export const CATEGORY_ICONS: Record<string, string> = {
  Vehicles: '🚗',
  Property: '🏠',
  Electronics: '📱',
  'Home & Garden': '🏡',
  'Fashion & Beauty': '👗',
  Animals: '🐕',
  'Hobby, Sport & Kids': '⚽',
  'Business & Industry': '💼',
  Education: '📚',
  Agriculture: '🌾',
};
