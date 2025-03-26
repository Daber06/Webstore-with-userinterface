import "../styles/Products.css";
import { Link } from "react-router-dom";
import Form from "./Form";
import axios from "axios";
import { useState, useEffect } from "react";

interface Product {
  _id: string;
  productNames: string;
  productPrices: string;
  productImages: string;
}

interface Props {
  heading: string;
  products: Product[];
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const Products: React.FC<Props> = ({ heading, products, setRefresh }) => {
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]); 
  const [sortOrder, setSortOrder] = useState<string>("asc");

  useEffect(() => {
    setSortedProducts(products);
  }, [products]); 

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const order = e.target.value;
    setSortOrder(order);

    const sorted = [...products].sort((a, b) => {
      const priceA = parseFloat(a.productPrices); 
      const priceB = parseFloat(b.productPrices);

      if (order === "asc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    setSortedProducts(sorted); 
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products/${id}`
      );
      setRefresh((prev) => !prev); 
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <>
      <h1>{heading}</h1>
      <div className="sort-container">
        <label htmlFor="sortOrder">Sort by Price: </label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={handleSortChange}
          className="sort-select"
        >
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>
      <ul className="products">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <li className="products-item" key={product._id}>
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
                className="delete-button"
                onClick={() => handleDelete(product._id)}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <li>No products available</li>
        )}
        <li className="products-item">
          <div className="product">
            <Form setRefresh={setRefresh} />
          </div>
        </li>
      </ul>
    </>
  );
};

export default Products;
