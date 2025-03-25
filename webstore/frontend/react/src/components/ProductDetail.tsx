// src/components/ProductDetail.tsx
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
  const { productId } = useParams<{ productId: string }>(); // Get the product ID from URL params
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Fetch product details from the backend
    axios 
      .get(`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products/${productId}`)
      .then((response) => {
        console.log(response.data);
        setProduct(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  }, [productId]);  

  if (!product) {
    return <div>Loading...</div>; // Show loading while the product is being fetched
  }

  return (
    <div className="product-detail">
      <img
        src={`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev${product.productImages}`}
        alt={product.productNames}
        className="product-detail-image"
      />
      <div className="product-detail-description">
        <p>{product.productNames}</p>
        <p>{product.productPrices}$</p>
        <p>{product.description}</p>
      </div>
    </div>
  );
};

export default ProductDetail;

