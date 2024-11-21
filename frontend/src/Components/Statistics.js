import React, { useEffect, useState } from 'react';

const Statistics = ({ selectedMonth }) => {
    const [statistics, setStatistics] = useState({
        totalSalesAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`http://localhost:5000/statistics?month=${selectedMonth}`);
                const data = await response.json();
                console.log(data)
                if (response.ok) {
                    setStatistics({
                        totalSalesAmount: data.data.totalSaleAmount || 0,
                        totalSoldItems: data.data.totalSoldItems || 0,
                        totalNotSoldItems: data.data.totalNotSoldItems || 0,
                    });
                } else {
                    setError(data.message || 'Failed to fetch statistics');
                }
            } catch (err) {
                setError('Failed to fetch statistics');
            } finally {
                setLoading(false);
            }
        };

        if (selectedMonth) {
            fetchStatistics();
        }
    }, [selectedMonth]);

    return (
        <div className="statistics-container">
            <h2>Transaction Statistics for {selectedMonth}</h2>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div className="statistics-boxes">
                    <div className="stat-box">
                        <h3>Total Sales Amount</h3>
                        <p>${statistics.totalSalesAmount.toFixed(2)}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Total Sold Items</h3>
                        <p>{statistics.totalSoldItems}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Total Not Sold Items</h3>
                        <p>{statistics.totalNotSoldItems}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statistics;
