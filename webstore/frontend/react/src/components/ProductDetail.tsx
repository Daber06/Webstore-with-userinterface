import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/ProductDetail.css";

interface Product {
  _id: string;
  productNames: string;  
  productPrices: string;
  productImages: string;
  description: string;  
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  useEffect(() => {
    axios 
      .get(`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products/${productId}`)
      .then((response) => {
        setProduct(response.data);
        setEditedProduct(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  }, [productId]);  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Product) => {
    if (editedProduct) {
      setEditedProduct({ ...editedProduct, [field]: e.target.value });
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products/${productId}`,
        editedProduct
      );
      setProduct(editedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const token = localStorage.getItem("token");
  
      if (token) {
       
        axios.post("https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/cart", 
          { productId: product._id, quantity: 1 }, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        .then(() => {
          setAddedToCart(true);
          console.log("Product added to cart (server)");
        })
        .catch((error) => {
          console.error("Error adding product to cart:", error);
        });
      } else {
  
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!cart.find((item: Product) => item._id === product._id)) {
          cart.push({ ...product, quantity: 1 }); 
          localStorage.setItem("cart", JSON.stringify(cart));
          setAddedToCart(true);
        }
      }
    }
  };

  if (!product || !editedProduct) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-detail">
      <img
        src={`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev${product.productImages}`}
        alt={product.productNames}
        className="product-detail-image"
      />
      <div className="product-detail-description">
        {isEditing ? (
          <>
            <input 
              type="text"
              value={editedProduct.productNames}
              onChange={(e) => handleChange(e, "productNames")}
            />
            <input 
              type="number"
              value={editedProduct.productPrices}
              onChange={(e) => handleChange(e, "productPrices")}
            />
            <textarea 
              value={editedProduct.description}
              onChange={(e) => handleChange(e, "description")}
            />
            <button onClick={handleSave} className="save-button">Save</button>
          </>
        ) : (
          <>
            <p>{product.productNames}</p>
            <p>{product.productPrices}$</p>
            <p>{product.description}</p>
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit</button>
          </>
        )}
        
        <button onClick={handleAddToCart} className="add-to-cart-button">
          Add to Cart
        </button>
        {addedToCart && <p className="success-message">Item added to cart!</p>} 
      </div>
    </div>
  );
};

export default ProductDetail;
