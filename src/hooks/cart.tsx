import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  // AsyncStorage.removeItem('cart');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('cart');

      if (!cart) {
        setProducts([]);
      } else {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productFoundIndex = products.findIndex(
        product => product.id === id,
      );

      const cart = JSON.parse(JSON.stringify(products));

      cart[productFoundIndex].quantity += 1;

      setProducts(cart);

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productFoundIndex = products.findIndex(
        product => product.id === id,
      );

      const cart = JSON.parse(JSON.stringify(products));

      cart[productFoundIndex].quantity -= 1;

      if (cart[productFoundIndex].quantity === 0) {
        cart.splice(productFoundIndex, 1);
      }

      setProducts(cart);

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const cart = products;

      if (cart.find(loopProduct => loopProduct.id === product.id)) {
        increment(product.id);
      } else {
        cart.push(Object.assign(product, { quantity: 1 }));

        await AsyncStorage.setItem('cart', JSON.stringify(cart));

        setProducts(cart);

        console.log(cart);
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
