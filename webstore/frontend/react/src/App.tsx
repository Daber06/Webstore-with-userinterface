import { useEffect, useState } from "react";
import axios from "axios";
import Products from "./components/Products";
import Form from "./components/Form";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

interface Product {
  _id: string;
  productNames: string;
  productPrices: string;
  productImages: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refresh, setRefresh] = useState(false); //  Track refresh state

  useEffect(() => {
    axios.get("https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products")
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error("There was an error making the request:", error);
      });
  }, [refresh]); //  Only refresh when `refresh` changes

  return (
    <div>
      <Products products={products} heading="Products" setRefresh={setRefresh}/>
      <Form setRefresh={setRefresh} />  {/*  Trigger refresh after uploading */}
      <Footer />
    </div>
  );
}

export default App;
