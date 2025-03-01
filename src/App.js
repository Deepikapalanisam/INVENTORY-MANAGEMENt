import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddStock from './pages/AddStock';
import GenerateBill from './pages/GenerateBill';
import LowStock from './pages/LowStock';
import './App.css';

function Navbar() {
    return (
        <nav className="navbar">
            <h1 className="logo">KPS SILKS</h1>
            <div className="nav-links">
                {['Home', 'My Stock', 'Generate Bill', 'Low Stock'].map((item, index) => (
                    <Link 
                        key={index} 
                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                        className="nav-link"
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </nav>
    );
}


function Home() {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/products")
            .then((res) => res.json())
            .then((data) => setProducts(groupByProduct(data)))
            .catch((err) => console.error("❌ Error Fetching Products:", err));

        fetch("http://localhost:5000/api/bills")
            .then((res) => res.json())
            .then((data) => setSales(groupByProduct(data)))
            .catch((err) => console.error("❌ Error Fetching Sales:", err));
    }, []);

    const groupByProduct = (data) => {
        return data.reduce((acc, item) => {
            const existingProduct = acc.find(p => p.productName === item.productName);
            if (existingProduct) {
                existingProduct.quantity += item.quantity;
                existingProduct.totalAmount += item.quantity * item.amount;
            } else {
                acc.push({
                    productName: item.productName,
                    quantity: item.quantity,
                    totalAmount: item.quantity * item.amount
                });
            }
            return acc;
        }, []);
    };

    const totalPurchasedAmount = products.reduce((acc, product) => acc + product.totalAmount, 0);
    const totalSalesAmount = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    return (
        <div className="home-container">
            <div className="dashboard">
                <h2>Dashboard Overview</h2>
                
                <div className="summary">
                    <h3>Total Purchased Products: {products.length}</h3>
                    <h3>Total Purchased Amount: ₹{totalPurchasedAmount.toFixed(2)}</h3>
                    <h3>Total Sold Products: {sales.length}</h3>
                    <h3>Total Sales Amount: ₹{totalSalesAmount.toFixed(2)}</h3>
                </div>
                
                <div className="grid-container">
                    {/* Purchased Products Table */}
                    <div className="table-section">
                        <h3>Purchased Products</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.productName}>
                                        <td>{product.productName}</td>
                                        <td>{product.quantity}</td>
                                        <td>₹{product.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Sales Products Table */}
                    <div className="table-section">
                        <h3>Sales Products</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.productName}>
                                        <td>{sale.productName}</td>
                                        <td>{sale.quantity}</td>
                                        <td>₹{sale.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}



function Content() {
    return (
        <div className="content">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/my-stock" element={<AddStock />} />
                <Route path="/generate-bill" element={<GenerateBill />} />
                <Route path="/low-stock" element={<LowStock />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <Content />
            </div>
        </Router>
    );
}

export default App;
