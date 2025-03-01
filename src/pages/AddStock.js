import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddStock.css';

function AddStock() {
    const [formData, setFormData] = useState({
        productName: '',
        manufacturer: '',
        quantity: '',
        date: '',
        amount: '',
        totalAmount: 0
    });

    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch products from the database
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            setProducts(response.data.sort((a, b) => {
                if (a.productName === b.productName) {
                    return a.manufacturer.localeCompare(b.manufacturer);
                }
                return a.productName.localeCompare(b.productName);
            }));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Handle input changes and calculate totalAmount
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedData = {
                ...prev,
                [name]: name === "quantity" || name === "amount" ? Number(value) || 0 : value
            };
            if (name === "quantity" || name === "amount") {
                updatedData.totalAmount = updatedData.quantity * updatedData.amount;
            }
            return updatedData;
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { productName, manufacturer, quantity, date, amount, totalAmount } = formData;
            const requestData = { productName, manufacturer, quantity, date, amount, totalAmount };

            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/edit/${editingId}`, requestData);
                alert('Stock updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/products/add', requestData);
                alert('Stock added successfully!');
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Error adding/updating stock:", error);
        }
    };

    // Edit existing stock
    const handleEdit = (product) => {
        setFormData({ 
            ...product, 
            quantity: product.quantity || 0, 
            amount: product.amount || 0,
            totalAmount: product.quantity * product.amount
        });
        setEditingId(product._id);
    };

    // Delete a product
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`http://localhost:5000/api/products/delete/${id}`);
                alert("Product deleted successfully!");
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    // Reset form fields
    const resetForm = () => {
        setFormData({ 
            productName: '', 
            manufacturer: '', 
            quantity: '', 
            date: '', 
            amount: '', 
            totalAmount: 0 
        });
        setEditingId(null);
    };

    return (
        <div className="container">
            <h2>{editingId ? "Edit Stock" : "Add Stock"}</h2>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {['productName', 'manufacturer', 'date'].map((field, index) => (
                        <input 
                            key={index} 
                            type={field === 'date' ? 'date' : 'text'}
                            name={field}
                            placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                        />
                    ))}
                    <input 
                        type="number" 
                        name="quantity" 
                        placeholder="Quantity" 
                        value={formData.quantity} 
                        onChange={handleChange} 
                        min="0" 
                        step="1"
                        required
                        onInput={(e) => e.target.value = e.target.value.replace(/[eE]/g, '')}
                    />
                    <input 
                        type="number" 
                        name="amount" 
                        placeholder="Amount Per Unit (₹)" 
                        value={formData.amount} 
                        onChange={handleChange} 
                        min="0" 
                        step="1"
                        required
                        onInput={(e) => e.target.value = e.target.value.replace(/[eE]/g, '')}
                    />
                    <input 
                        type="text" 
                        name="totalAmount" 
                        placeholder="Total Amount (₹)" 
                        value={`₹${formData.totalAmount}`} 
                        readOnly 
                        style={{ width: '120px' }}
                    />

                    <button type="submit" disabled={!formData.productName || !formData.manufacturer || !formData.date}>
                        {editingId ? 'Update Stock' : 'Add Stock'}
                    </button>
                </form>
            </div>

            <div className="products-container">
                <h3>Purchased Stocks</h3>
                <table>
                    <thead>
                        <tr>
                            {['Product Name', 'Manufacturer', 'Quantity', 'Date', 'Amount Per Unit (₹)', 'Total Amount (₹)', 'Actions'].map((heading, index) => (
                                <th key={index}>{heading}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product.productName}</td>
                                    <td>{product.manufacturer}</td>
                                    <td>{product.quantity}</td>
                                    <td>{new Date(product.date).toLocaleDateString()}</td>
                                    <td>₹{product.amount}</td>
                                    <td>₹{product.totalAmount}</td>
                                    <td>
                                        <button onClick={() => handleEdit(product)}>✏️ Edit</button>
                                        <button onClick={() => handleDelete(product._id)}>❌ Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No stock available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AddStock;
