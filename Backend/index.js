const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Product = require('./models/Product');
const app = express();
const cors = require('cors');

const PORT = 5000;
app.use(cors()); // Enable CORS
app.use(express.json());
// Connecting to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Mern-data', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, 
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));
// API to init the db

app.get('/initialize', async (req, res) => {
    try {
      const response = await axios.get(
        'https://s3.amazonaws.com/roxiler.com/product_transaction.json'
      );
      const products = response.data;
  
      // Clearing existing data
      console.log('Clearing existing data...');
      await Product.deleteMany();
  
      // Inserting data in batches
      console.log('Inserting data in batches...');
      const batchSize = 100; // Adjusting batch size 
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await Product.insertMany(batch);
        console.log(`Inserted batch ${i / batchSize + 1}`);
      }
  
      res.status(200).json({
        message: 'Database successfully initialized !',
        totalRecords: products.length,
      });
    } catch (error) {
      console.error('Error in  initializing db :', error.message);
      res.status(500).json({
        message: 'Failed to initialize database',
        error: error.message,
      });
    }
  });

//Creating an API to list the all transactions
app.get('/transactions', async (req, res) => {
    try {
      const { month, search = '', page = 1, perPage = 10 } = req.query;
  
      if (!month) {
        return res.status(400).json({ message: 'Month is required.' });
      }
  
      const monthIndex = new Date(Date.parse(`${month} 1, 2020`)).getMonth();
  
      if (monthIndex === NaN || monthIndex < 0 || monthIndex > 11) {
        return res.status(400).json({ message: 'Invalid month provided.' });
      }
  
      // Building the search query
      const query = {
        $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] }, // Match month
      };
  
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { price: !isNaN(parseFloat(search)) ? parseFloat(search) : undefined }, 
      ].filter((q) => q.price !== undefined || q.title || q.description);
      }
  
      // Pagination
      const limit = parseInt(perPage, 10);
      const skip = (parseInt(page, 10) - 1) * limit;
  
      // Fetching records
      const transactions = await Product.find(query).skip(skip).limit(limit);
  
      // Counting total records for pagination
      const totalRecords = await Product.countDocuments(query);
  
      res.status(200).json({
        message: 'Transactions fetched successfully',
        data: transactions,
        pagination: {
          page: parseInt(page, 10),
          perPage: limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      res.status(500).json({
        message: 'Failed to fetch transactions',
        error: error.message,
      });
    }
  });
//Creating an API for statistics
app.get('/statistics', async (req, res) => {
    try {
      const { month } = req.query;
  
      if (!month) {
        return res.status(400).json({ message: 'Month is required.' });
      }
  
      const monthIndex = new Date(Date.parse(`${month} 1, 2020`)).getMonth();
  
      if (monthIndex === NaN || monthIndex < 0 || monthIndex > 11) {
        return res.status(400).json({ message: 'Invalid month provided.' });
      }
  
      const query = { $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] } };
  
      // Fetching statistics
      const totalSaleAmount = await Product.aggregate([
        { $match: query },
        { $match: { sold: true } }, 
        { $group: { _id: null, totalAmount: { $sum: '$price' } } },
      ]);
  
      const totalSoldItems = await Product.countDocuments({ ...query, sold: true });
      const totalNotSoldItems = await Product.countDocuments({ ...query, sold: false });
  
      res.status(200).json({
        message: 'Statistics fetched successfully',
        data: {
          totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0, // setting to 0 if no sold items
          totalSoldItems,
          totalNotSoldItems,
        },
      });
    } catch (error) {
      console.error('Error fetching statistics:', error.message);
      res.status(500).json({
        message: 'Failed to fetch statistics',
        error: error.message,
      });
    }
  });
// Creating API for Bar-chart
app.get('/bar-chart', async (req, res) => {
    try {
      const { month } = req.query;
  
      if (!month) {
        return res.status(400).json({ message: 'Month is required.' });
      }
  
      const monthIndex = new Date(Date.parse(`${month} 1, 2020`)).getMonth();
  
      if (monthIndex === NaN || monthIndex < 0 || monthIndex > 11) {
        return res.status(400).json({ message: 'Invalid month provided.' });
      }
  
      const query = { $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] } };
  
      const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Infinity }
      ];
  
      // now for each price range, counting the items in that range
      const priceRangeCounts = await Promise.all(
        priceRanges.map(async (range) => {
          const count = await Product.countDocuments({
            ...query,
            price: { $gte: range.min, $lte: range.max }
          });
          return {
            priceRange: `${range.min} - ${range.max === Infinity ? 'above' : range.max}`,
            count
          };
        })
      );
  
      res.status(200).json({
        message: 'Bar chart data fetched successfully',
        data: priceRangeCounts
      });
    } catch (error) {
      console.error('Error fetching bar chart data:', error.message);
      res.status(500).json({
        message: 'Failed to fetch bar chart data',
        error: error.message
      });
    }
  });
//Creating API for Pie-chart
app.get('/pie-chart', async (req, res) => {
    try {
      const { month } = req.query;
  
      if (!month) {
        return res.status(400).json({ message: 'Month is required.' });
      }
        const monthIndex = new Date(Date.parse(`${month} 1, 2020`)).getMonth();
  
      if (monthIndex === NaN || monthIndex < 0 || monthIndex > 11) {
        return res.status(400).json({ message: 'Invalid month provided.' });
      }
        const query = { $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] } };
  
      //I am  using aggregation pipeline to group by category and count items in each category
      const categoryCounts = await Product.aggregate([
        { $match: query }, 
        { $group: { _id: '$category', count: { $sum: 1 } } }, 
        { $project: { _id: 0, category: '$_id', count: 1 } }, 
      ]);
  
      res.status(200).json({
        message: 'Pie chart data fetched successfully',
        data: categoryCounts
      });
    } catch (error) {
      console.error('Error fetching pie chart data:', error.message);
      res.status(500).json({
        message: 'Failed to fetch pie chart data',
        error: error.message
      });
    }
  });
// Combined API 
app.get('/combined-data', async (req, res) => {
  try {
    const { month, search = '', page = 1, perPage = 10 } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month is required.' });
    }

    const monthIndex = new Date(Date.parse(`${month} 1, 2020`)).getMonth();

    if (monthIndex === NaN || monthIndex < 0 || monthIndex > 11) {
      return res.status(400).json({ message: 'Invalid month provided.' });
    }

 // 1. Fetching Transaction Data
    const transactionQuery = {
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] }
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      transactionQuery.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { price: searchRegex }
      ];
    }

    const transactions = await Product.find(transactionQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalTransactions = await Product.countDocuments(transactionQuery);

// 2. Fetching Statistics Data
    const statistics = await Product.aggregate([
      { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] } } },
      { $group: {
        _id: null,
        totalSaleAmount: { $sum: '$price' },
        totalSoldItems: { $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] } },
        totalNotSoldItems: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } }
      }},
      { $project: { _id: 0 } }
    ]);

// 3. Fetching Pie Chart Data
    const pieChartData = await Product.aggregate([
      { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ]);
//Combining data into one JSOn object and sending response
    res.status(200).json({
      transactions: {
        total: totalTransactions,
        currentPage: page,
        perPage,
        data: transactions
      },
      statistics: statistics[0] || { totalSaleAmount: 0, totalSoldItems: 0, totalNotSoldItems: 0 },
      pieChartData
    });

  } catch (error) {
    console.error('Error fetching combined data:', error.message);
    res.status(500).json({
      message: 'Failed to fetch combined data',
      error: error.message
    });
  }
});
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
