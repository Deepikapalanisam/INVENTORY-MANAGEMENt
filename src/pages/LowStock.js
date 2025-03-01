import { useState, useEffect } from 'react';
import axios from 'axios';
import './LowStock.css';

function LowStock() {
    const [lowStockProducts, setLowStockProducts] = useState([]);

    useEffect(() => {
        fetchLowStockProducts();
    }, []);

    const fetchLowStockProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products/low-stock');
            
            // Aggregate quantities of products with the same name
            const productTotals = response.data.reduce((acc, product) => {
                if (acc[product.productName]) {
                    acc[product.productName].quantity += product.quantity;
                } else {
                    acc[product.productName] = { ...product };
                }
                return acc;
            }, {});
            
            // Filter products with total quantity less than 50
            const filteredProducts = Object.values(productTotals).filter(product => product.quantity < 50);
            
            setLowStockProducts(filteredProducts);
        } catch (error) {
            console.error("Error fetching low-stock products:", error);
        }
    };

    return (
        <div className="low-stock-container">
            <h2 className="low-stock-title">Low Stock Alert</h2>

            {lowStockProducts.length > 0 ? (
                <div className="low-stock-products">
                    <div className="low-stock-table-container">
                        <table className="low-stock-table">
                            <thead className="low-stock-thead">
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="low-stock-tbody">
                                {lowStockProducts.map((product, index) => (
                                    <tr key={index}>
                                        <td>{product.productName}</td>
                                        <td className="low-stock-quantity">{product.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="no-low-stock-message">No low-stock products!</p>
            )}
        </div>
    );
}

export default LowStock;