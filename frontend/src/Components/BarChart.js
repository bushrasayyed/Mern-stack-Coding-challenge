import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
    const [data, setData] = useState([]);
    const [priceRanges, setPriceRanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('January');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Here I had Fetch data when selectedMonth changes
    useEffect(() => {
        const fetchBarChartData = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`http://localhost:5000/bar-chart?month=${selectedMonth}`);
                const result = await response.json();

                console.log(result);  

                if (result.data && Array.isArray(result.data)) {
                    const priceRangesData = result.data.map(item => item.priceRange);
                    const countData = result.data.map(item => item.count);

                    setPriceRanges(priceRangesData);  
                    setData(countData);  
                } else {
                    setError('Invalid data format');
                }
            } catch (err) {
                setError('Failed to fetch chart data');
            } finally {
                setLoading(false);
            }
        };

        fetchBarChartData();
    }, [selectedMonth]);

    //Here I had Prepared chart data
    const chartData = {
        labels: priceRanges,  // Using price ranges for X-axis labels
        datasets: [
            {
                label: 'Number of Items',
                data: data,  // Using  item counts
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,  
        plugins: {
            title: {
                display: true,
                text: `Transactions in ${selectedMonth}`,
                font: {
                    size: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `${context.dataset.label}: ${context.raw} items`;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Price Range',
                },
                grid: {
                    display: true,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Items',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="bar-chart-container">
            <h3>Transactions Bar Chart</h3>

            <div className="month-dropdown">
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="month-select"
                >
                    {months.map((month) => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div>Loading chart data...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div className="bar-chart">
                    <Bar data={chartData} options={chartOptions} height={200} />
                </div>
            )}
        </div>
    );
};

export default BarChart;
