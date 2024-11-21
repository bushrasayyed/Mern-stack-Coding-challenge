import React, { useState } from 'react';
import Transactions from './Transactions';
import Statistics from './Statistics';
import BarChart from './BarChart';  

import '../App.css';

const Dashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState('March');
    const [searchText, setSearchText] = useState('');
    const [statsMonth, setStatsMonth] = useState('March'); // Heres Separate state for statistics month

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleStatsMonthChange = (e) => {
        setStatsMonth(e.target.value); // Here I am updating the month for statistics
    };

    return (
        <div className="dashboard">
            <h1 className="header">Transaction Dashboard</h1>

            <div className="controls">
                <select
                    className="dropdown"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
                <input
                    className="search-box"
                    type="text"
                    placeholder="Search transactions..."
                    value={searchText}
                    onChange={handleSearchChange}
                />
            </div>

            <Transactions selectedMonth={selectedMonth} searchText={searchText} />

            <div className="controls">
                <select
                    className="dropdown"
                    value={statsMonth}
                    onChange={handleStatsMonthChange}
                >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
            </div>

            <Statistics selectedMonth={statsMonth} />
            <BarChart selectedMonth={selectedMonth} />

        </div>

    );
};

export default Dashboard;
