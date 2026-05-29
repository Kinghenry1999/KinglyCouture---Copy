import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utility/Api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user || user.role !== 'user') return;
    try {
      const response = await api.get('/wishlist');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      await api.post(`/wishlist/${productId}`);
      toast.success('Added to wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.info('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};