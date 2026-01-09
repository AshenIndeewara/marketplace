import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://marketplace-backend-eta-nine.vercel.app/api/v1';


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});


export const getAuthToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setAuthToken = (token: string) => localStorage.setItem('accessToken', token);
export const setRefreshToken = (token: string) => localStorage.setItem('refreshToken', token);
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


let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };


    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {

        removeAuthToken();
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      try {

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;


        setAuthToken(accessToken);


        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }


        processQueue(null, accessToken);


        return axiosInstance(originalRequest);
      } catch (refreshError: any) {

        processQueue(refreshError, null);
        removeAuthToken();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export const authAPI = {
  register: async (data: { email: string; firstname: string; lastname: string; password: string; phone: string }) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const data = response.data;
    if (data.data?.accessToken) {
      setAuthToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
      setUser({ email: data.data.email, roles: data.data.roles });
    }
    return data;
  },

  logout: () => {
    removeAuthToken();
  },
};


export const askAPI = {
  search: async (query: string) => {
    const response = await axiosInstance.post('/ask/search', { query });
    return response.data;
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
    const response = await axiosInstance.get(`/item/all${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/item/${id}`);
    return response.data;
  },

  search: async (q: string) => {
    const response = await axiosInstance.get(`/item?q=${encodeURIComponent(q)}`);
    return response.data;
  },

  getByCategory: async (category: string, subCategory?: string) => {
    const url = subCategory
      ? `/item/${encodeURIComponent(category)}/${encodeURIComponent(subCategory)}`
      : `/item/all?category=${encodeURIComponent(category)}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getCategories: async () => {
    const response = await axiosInstance.get('/item/categories');
    return response.data;
  },

  add: async (formData: FormData) => {
    const response = await axiosInstance.post('/item/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData) => {
    const response = await axiosInstance.put(`/item/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/item/delete/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await axiosInstance.put(`/item/approve/${id}`);
    return response.data;
  },

  reject: async (id: string) => {
    const response = await axiosInstance.put(`/item/reject/${id}`);
    return response.data;
  },

  markSold: async (id: string) => {
    const response = await axiosInstance.put(`/item/sold/${id}`);
    return response.data;
  },
};


export const sellerAPI = {
  getMyItems: async () => {
    const response = await axiosInstance.get('/seller/my-items');
    return response.data;
  },

  addFavorite: async (itemId: string) => {
    const response = await axiosInstance.post(`/seller/favorite-item/${itemId}`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await axiosInstance.get('/seller/favorite-items');
    return response.data;
  },

  removeFavorite: async (itemId: string) => {
    const response = await axiosInstance.delete(`/seller/favorite-item/${itemId}`);
    return response.data;
  },
};


export const adminAPI = {
  getAllItems: async () => {
    const response = await axiosInstance.get('/admin/items');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  makeAdmin: async (id: string) => {
    const response = await axiosInstance.put(`/admin/make-admin/${id}`);
    return response.data;
  },

  removeAdmin: async (id: string) => {
    const response = await axiosInstance.put(`/admin/remove-admin/${id}`);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/delete-user/${id}`);
    return response.data;
  },
};


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
