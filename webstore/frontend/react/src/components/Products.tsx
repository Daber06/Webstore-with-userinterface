import "../styles/Products.css";
import axios from "axios";
import { Link } from "react-router-dom"; 
import Form from "./Form";

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
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products/${id}`);
      setRefresh(prev => !prev); 
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <>
      <h1>{heading}</h1>
      <ul className="products">
        {products.map((product) => (
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
            <button className="delete-button" onClick={() => handleDelete(product._id)}>Delete</button>
          </li> 
        ))}
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
