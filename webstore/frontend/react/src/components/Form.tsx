import { useState } from "react";
import axios from "axios";
import "../styles/Form.css"; //  Keep CSS import

interface Props {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const Form = ({ setRefresh }: Props) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("productNames", productName);
    formData.append("productPrices", productPrice);
    formData.append("description", description);
    if (productImage) formData.append("image", productImage);

    try {
      await axios.post("https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/upload", formData);
      setProductName("");
      setProductPrice("");
      setProductImage(null);
      setRefresh(prev => !prev); // ✅ Refresh product list
    } catch (error) {
      console.error("Error uploading product:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <input
        type="text"
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        required
        className="form-input"
      />
      <input
        type="number"
        placeholder="Price"
        value={productPrice}
        onChange={(e) => setProductPrice(e.target.value)}
        required
        className="form-input"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="form-input"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProductImage(e.target.files ? e.target.files[0] : null)}
        required
        className="form-input"
      />
      <button type="submit" className="form-button">Upload</button>
    </form>
  );
};

export default Form;
