import "../styles/Products.css";
import axios from "axios";

interface Product {
    _id: string;
    productNames: string;
    productPrices: string;
    productImages: string;
}

interface Props {
    heading: string;
    products: Product[];
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>; // Add this prop
}

const Products: React.FC<Props> = ({ heading, products, setRefresh }) => {  
    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/products/${id}`);
            setRefresh(prev => !prev); //  Refresh product list after deletion
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
                        <a href={`/products/${product._id}`} className="product-link">
                            <img 
                                src={`https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/${product.productImages}`} 
                                alt={product.productNames} 
                                className="product-image"
                            />
                            <div className="product-info">
                                <div>{product.productNames}</div> 
                                <div>{product.productPrices}$</div>
                            </div>
                        </a>
                        <button className="delete-button" onClick={() => handleDelete(product._id)}>Delete</button> {/*  Add Delete Button */}
                    </li> 
                ))}
            </ul>
        </>
    );
};

export default Products;
