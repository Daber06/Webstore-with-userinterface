import React, { useState, useEffect } from "react";
import "../styles/Cart.css";
import { Link } from "react-router-dom";
import axios from "axios";

interface Product {
  _id: string;
  productNames: string;
  productPrices: string;
  productImages: string;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<Product[]>([]);

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
          const formattedCart = response.data.products.map((item: Product) => ({
            _id: item._id,
            productNames: item.productNames,
            productPrices: item.productPrices,
            productImages: item.productImages 
          }));
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

  const handleRemoveFromCart = (id: string) => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .delete(
          `https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/cart/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setCart(response.data.cart.products); 
        })
        .catch((error) => {
          console.error("Error removing product from cart:", error);
        });
    } else {
      const updatedCart = cart.filter((item) => item._id !== id);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      console.log(updatedCart);
      setCart(updatedCart);
    }
  };

  if (cart.length === 0) {
    return <div>Your cart is empty.</div>;
  }

  return (
    <div className="cart-container">
      <h1>Cart</h1>
      <ul className="cart-products">
        {cart.map((product) => {
          const imageUrl = `https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev${product.productImages}`;
          console.log("Full Image URL:", imageUrl);
          console.log(product.productImages);
          console.log(product.productPrices);
          console.log(product); 

          return (
            <li className="cart-product" key={product._id}>
              <Link to={`/products/${product._id}`} className="product-link">
                <img
                  src={imageUrl}
                  alt={product.productNames}
                  className="product-image"
                />
                <div className="product-info">
                  <div>{product.productNames}</div>
                  <div>{product.productPrices}$</div>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveFromCart(product._id)}
                className="remove-from-cart-button"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Cart;
