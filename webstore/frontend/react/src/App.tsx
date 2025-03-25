import { useEffect, useState } from "react";
import axios from "axios";
import Products from "./components/Products";
import Cart from "./components/Cart";
import Signup from "./components/Signup";
import About from "./components/AboutUs";
import Footer from "./components/Footer";
import Menu from "./components/Menu";
import ProductDetail from "./components/ProductDetail"; // Import ProductDetail component
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

interface Product {
  _id: string;
  productNames: string;
  productPrices: string;
  productImages: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    axios.get("https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products")
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error("There was an error making the request:", error);
      });
  }, [refresh]);

  return (
    <Router>
      <div className="app-container">
        <Menu />
        <Routes>
          <Route path="/" element={<Products products={products} heading="Products" setRefresh={setRefresh} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/products/:productId" element={<ProductDetail />} /> {/* Add the new route for product details */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
