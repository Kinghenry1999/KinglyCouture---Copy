import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utility/Api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user || user.role !== 'user') return;   // only for users
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load cart');
      }
    }
  };

  const addToCart = async (productId, quantity) => {
    setLoading(true);
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to add items to cart');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(error.response?.data?.message || 'Failed to add item');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    setLoading(true);
    try {
      await api.put('/cart', { productId, quantity });
      await fetchCart();
      toast.info('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
      toast.info('Item removed');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchCart();
    } else {
      setCart([]); // clear cart when switching to non-user
    }
  }, [user]);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateCartItem,
      removeFromCart,
      getTotal,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};