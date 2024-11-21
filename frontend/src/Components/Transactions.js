import React, { useEffect, useState } from 'react';

const Transactions = ({ selectedMonth, searchText }) => {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);  
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10; 

    const fetchTransactions = async () => {
        try {
            const queryParams = new URLSearchParams({
                month: selectedMonth,
                page: page, 
                perPage: perPage,  
                ...(searchText ? { search: searchText } : {}),
            }).toString();

            const response = await fetch(`http://localhost:5000/transactions?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.data) {
                setTransactions(data.data || []);  
                setTotalPages(data.pagination.totalPages || 1); 
            } else {
                console.error('Invalid response data structure:', data);
                setTransactions([]); 
                setTotalPages(1); 
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);  
            setTotalPages(1);  
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth, searchText, page]);

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePrevious = () => {
        if (page > 1) setPage(page - 1);
    };

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Image</th>
                        <th>Sold</th>
                        <th>Date of Sale</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>No transactions found</td>
                        </tr>
                    ) : (
                        transactions.map((txn) => (
                            <tr key={txn.id}>
                                <td>{txn.id}</td>
                                <td>{txn.title}</td>
                                <td>${txn.price.toFixed(2)}</td>
                                <td>{txn.description}</td>
                                <td>{txn.category}</td>
                                <td><img src={txn.image} alt={txn.title} style={{ width: '50px', height: 'auto' }} /></td>
                                <td>{txn.sold ? 'Yes' : 'No'}</td>
                                <td>{new Date(txn.dateOfSale).toLocaleDateString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="pagination-controls">
                <button className="button" onClick={handlePrevious} disabled={page === 1}>
                    Previous
                </button>

                <span className="page-info">
                    Page {page} of {totalPages}
                </span>

                <button className="button" onClick={handleNext} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default Transactions;
