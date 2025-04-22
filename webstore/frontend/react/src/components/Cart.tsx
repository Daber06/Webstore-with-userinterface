import React, { useState, useEffect } from "react";
import "../styles/Cart.css";
import { Link } from "react-router-dom";
import axios from "axios";

interface CartProduct {
  cartItemId: string;
  _id: string; 
  productNames: string;
  productPrices: string;
  productImages: string;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartProduct[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); 
    console.log("Token from LocalStorage:", token); 

    const fetchCart = async () => {
      try {
        if (token) {
          const response = await axios.get(
            "https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/cart",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const formattedCart: CartProduct[] = response.data.products
          .filter((item: any) => item.productId !== null)
          .map((item: any) => ({
            cartItemId: item._id,
            _id: item.productId._id,
            productNames: item.productId.productNames,
            productPrices: item.productId.productPrices,
            productImages: item.productId.productImages
          }));
          
          console.log("Cart from API: ", formattedCart)
          setCart(formattedCart);
        } else {
          const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
          console.log("Stored Cart from LocalStorage:", storedCart);
          setCart(Array.isArray(storedCart) ? storedCart : []);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCart([]);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveFromCart = (productId: string) => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .delete(
          `https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/cart/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log('Response data from server:', response.data);
          const formattedCart: CartProduct[] = response.data.product
          .filter((item: any) => item.productId !== null)
          .map((item: any) => ({
            cartItemid: item._id,
            _id: item.productId._id,
            productNames: item.productId.productNames,
            productPrices: item.productId.productPrices,
            productImages: item.productId.productImages
          }));
          setCart(formattedCart); 
        })
        .catch((error) => {
          console.error("Error removing product from cart:", error);
        });
    } else {
      const updatedCart = cart.filter((item) => item._id !== productId);
      console.log("ProductId: ", productId)
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      console.log("UpdatedCart: ", updatedCart);
      setCart(updatedCart);
    }
  };

  if (cart.length === 0) {
    return <div className="cart-empty">Your cart is empty.</div>;
  }

  return (
    <div className="cart-container">
      <h1>Cart</h1>
      <ul className="cart-products">
        {cart.map((product) => (
            <li className="cart-product" key={product._id}>
              <Link to={`/products/${product._id}`} className="product-link">
                <img
                  src={`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev${product.productImages}`}
                  alt={product.productNames}
                  className="product-image"
                />
                <div className="product-info">
                  <div>{product.productNames}</div>
                  <div>{product.productPrices}$</div>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveFromCart(product.cartItemId || product._id)}
                className="remove-from-cart-button"
              >
                Remove
              </button>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
