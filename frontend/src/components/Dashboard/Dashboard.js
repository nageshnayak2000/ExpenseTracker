// src/components/Dashboard/Dashboard.js

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Spinner,
    Alert,
    Button,
    Modal,
    Form,
    Table,
} from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { ErrorContext } from '../../context/ErrorContext';
// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Helper function to get the last 'n' days
const getLastNDays = (n) => {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]); // 'YYYY-MM-DD'
    }
    return days;
};

// Helper function to aggregate data per month
const aggregateMonthlyData = (transactionsData) => {
    const monthlyData = {};

    transactionsData.forEach((txn) => {
        const date = new Date(txn.date);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., 'Jan 2024'

        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expenses: 0 };
        }

        if (txn.transaction_type === 'income') {
            monthlyData[month].income += parseFloat(txn.amount);
        } else if (txn.transaction_type === 'expense') {
            monthlyData[month].expenses += parseFloat(txn.amount);
        }
    });

    // Convert the object to an array sorted by date
    const sortedMonthlyData = Object.keys(monthlyData)
        .map((month) => ({
            month,
            income: monthlyData[month].income,
            expenses: monthlyData[month].expenses,
        }))
        .sort((a, b) => new Date(a.month) - new Date(b.month));

    return sortedMonthlyData;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { error, setError, success, setSuccess } = useContext(ErrorContext);

    // State variables
    const [transactions, setTransactions] = useState([]);
    // Removed 'categories' state as it's not used
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Statistics
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [balance, setBalance] = useState(0);

    // Chart Data States
    const [dailyExpensesData, setDailyExpensesData] = useState({});
    const [expenseDistributionData, setExpenseDistributionData] = useState({});
    const [barChartData, setBarChartData] = useState({});

    // Reset Modal State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Export State
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState('json'); // 'json' or 'csv'

    // Fetch transactions (categories removed)
    const fetchData = async () => {
        const access = localStorage.getItem('access_token');
        try {
            const txnResponse = await fetch('/api/transactions/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                },
            });

            if (!txnResponse.ok) {
                if (txnResponse.status === 401) {
                    setError('Session expired. Please log in again.');
                    navigate('/login');
                } else if (txnResponse.status >= 500) {
                    setError('Server error. Please try again later.');
                } else {
                    const errorData = await txnResponse.json();
                    setError(
                        errorData.detail ||
                            'Failed to fetch transactions. Please try again.'
                    );
                }
            } else {
                const txnData = await txnResponse.json();
                setTransactions(txnData);
                calculateStatistics(txnData);
                prepareChartData(txnData);
            }
        } catch (error) {
            setError(
                'Network error. Please check your connection and try again.'
            );
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Calculate statistics
    const calculateStatistics = (transactionsData) => {
        const income = transactionsData
            .filter((txn) => txn.transaction_type === 'income')
            .reduce((acc, txn) => acc + parseFloat(txn.amount), 0);

        const expenses = transactionsData
            .filter((txn) => txn.transaction_type === 'expense')
            .reduce((acc, txn) => acc + parseFloat(txn.amount), 0);

        setTotalIncome(income);
        setTotalExpenses(expenses);
        setBalance(income - expenses);
    };

    // Prepare data for charts
    const prepareChartData = (transactionsData) => {
        // Bar Chart: Daily Expenses (Last 30 Days)
        const last30Days = getLastNDays(30);
        const dailyExpenses = {};

        last30Days.forEach((day) => {
            dailyExpenses[day] = 0;
        });

        transactionsData.forEach((txn) => {
            if (txn.transaction_type === 'expense') {
                if (dailyExpenses.hasOwnProperty(txn.date)) {
                    dailyExpenses[txn.date] += parseFloat(txn.amount);
                }
            }
        });

        const dailyExpensesChartData = {
            labels: last30Days.map((day) => day.slice(5)), // 'MM-DD'
            datasets: [
                {
                    label: 'Daily Expenses ($)',
                    data: last30Days.map((day) => dailyExpenses[day]),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
            ],
        };

        setDailyExpensesData(dailyExpensesChartData);

        // Pie Chart: Expenses Distribution by Category
        const categoryExpenses = {};

        transactionsData.forEach((txn) => {
            if (txn.transaction_type === 'expense' && txn.category) {
                const categoryName = txn.category_name || 'Uncategorized'; // Ensure 'category_name' is provided by the serializer
                if (categoryExpenses.hasOwnProperty(categoryName)) {
                    categoryExpenses[categoryName] += parseFloat(txn.amount);
                } else {
                    categoryExpenses[categoryName] = parseFloat(txn.amount);
                }
            }
        });

        const expenseDistributionChartData = {
            labels: Object.keys(categoryExpenses),
            datasets: [
                {
                    label: 'Expenses by Category ($)',
                    data: Object.values(categoryExpenses),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#C9CBCF',
                        '#FF6384',
                        '#36A2EB',
                    ],
                },
            ],
        };

        setExpenseDistributionData(expenseDistributionChartData);

        // Bar Chart: Income vs. Expenses per Month
        const monthlyAggregatedData = aggregateMonthlyData(transactionsData);

        const incomeExpensesBarChartData = {
            labels: monthlyAggregatedData.map((data) => data.month),
            datasets: [
                {
                    label: 'Income ($)',
                    data: monthlyAggregatedData.map((data) => data.income),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // Teal
                },
                {
                    label: 'Expenses ($)',
                    data: monthlyAggregatedData.map((data) => data.expenses),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
                },
            ],
        };

        setBarChartData(incomeExpensesBarChartData);
    };

    // Fetch data on mount
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle manual refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Handle Reset Actions
    const handleReset = async () => {
        setResetting(true);
        const access = localStorage.getItem('access_token');
        try {
            const response = await fetch('/api/reset/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                },
            });

            if (response.status === 200) {
                const data = await response.json();
                setSuccess(data.detail || 'All data has been reset.');
                // Clear transactions and charts
                setTransactions([]);
                setTotalIncome(0);
                setTotalExpenses(0);
                setBalance(0);
                setDailyExpensesData({});
                setExpenseDistributionData({});
                setBarChartData({});
            } else {
                const errorData = await response.json();
                setError(
                    errorData.detail ||
                        'Failed to reset data. Please try again.'
                );
            }
        } catch (error) {
            setError(
                'Network error. Please check your connection and try again.'
            );
            console.error('Error resetting data:', error);
        } finally {
            setResetting(false);
            setShowResetModal(false);
        }
    };

    // Handle Data Export
    const handleExport = async () => {
        setExporting(true);
        const access = localStorage.getItem('access_token');
        let endpoint = '';
        let filename = '';

        if (exportFormat === 'json') {
            endpoint = '/api/export/json/';
            filename = 'data_export.json';
        } else if (exportFormat === 'csv') {
            endpoint = '/api/export/csv/';
            filename = 'data_export.csv';
        } else {
            setError('Invalid export format selected.');
            setExporting(false);
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': exportFormat === 'csv' ? 'text/csv' : 'application/json',
                    'Authorization': `Bearer ${access}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setSuccess('Data exported successfully.');
            } else {
                const errorData = await response.json();
                setError(
                    errorData.detail ||
                        'Failed to export data. Please try again.'
                );
            }
        } catch (error) {
            setError(
                'Network error. Please check your connection and try again.'
            );
            console.error('Error exporting data:', error);
        } finally {
            setExporting(false);
        }
    };


    return (
            <Container className="mt-4">
                <Row className="mb-3">
                    <Col>
                        <h2>Dashboard</h2>
                    </Col>
                    <Col className="text-end">
                        <Button
                            variant="secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="me-2"
                        >
                            {refreshing ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Refreshing...
                                </>
                            ) : (
                                'Refresh'
                            )}
                        </Button>

                        {/* Export Format Selection */}
                        <Form.Select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            style={{ width: '150px', display: 'inline-block', marginRight: '10px' }}
                            className="me-2"
                        >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                        </Form.Select>

                        <Button
                            variant="info"
                            onClick={handleExport}
                            disabled={exporting}
                            className="me-2"
                        >
                            {exporting ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Exporting...
                                </>
                            ) : (
                                'Export Data'
                            )}
                        </Button>

                        <Button
                            variant="danger"
                            onClick={() => setShowResetModal(true)}
                            disabled={resetting}
                        >
                            {resetting ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Resetting...
                                </>
                            ) : (
                                'Reset All Data'
                            )}
                        </Button>
                    </Col>
                </Row>

                {/* Display Error Alert */}
                {error && (
                    <Alert
                        variant="danger"
                        onClose={() => setError('')}
                        dismissible
                    >
                        {error}
                    </Alert>
                )}

                {/* Display Success Alert */}
                {success && (
                    <Alert
                        variant="success"
                        onClose={() => setSuccess('')}
                        dismissible
                    >
                        {success}
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center my-5">
                        <Spinner
                            animation="border"
                            variant="primary"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    <>
                        <Row>
                            {/* Total Income */}
                            <Col md={4} className="mb-3">
                                <Card bg="success" text="white">
                                    <Card.Body>
                                        <Card.Title>Total Income</Card.Title>
                                        <Card.Text style={{ fontSize: '1.5rem' }}>
                                            ${totalIncome.toFixed(2)}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Total Expenses */}
                            <Col md={4} className="mb-3">
                                <Card bg="danger" text="white">
                                    <Card.Body>
                                        <Card.Title>Total Expenses</Card.Title>
                                        <Card.Text style={{ fontSize: '1.5rem' }}>
                                            ${totalExpenses.toFixed(2)}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Balance */}
                            <Col md={4} className="mb-3">
                                <Card
                                    bg={balance >= 0 ? 'primary' : 'warning'}
                                    text="white"
                                >
                                    <Card.Body>
                                        <Card.Title>Balance</Card.Title>
                                        <Card.Text style={{ fontSize: '1.5rem' }}>
                                            ${balance.toFixed(2)}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Charts */}
                        <Row className="mt-4">
                            {/* Bar Chart: Income vs. Expenses per Month */}
                            <Col md={12} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Income vs. Expenses (Monthly)</Card.Title>
                                        <div style={{ height: '400px' }}>
                                            {barChartData.labels && barChartData.datasets ? (
                                                <Bar
                                                    data={barChartData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false, // Disable default aspect ratio
                                                        plugins: {
                                                            legend: {
                                                                position: 'top',
                                                            },
                                                            title: {
                                                                display: false,
                                                            },
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                ticks: {
                                                                    callback: function (value) {
                                                                        return '$' + value;
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <p>No income or expense data available.</p>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Daily Expenses */}
                            <Col md={6} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Daily Expenses (Last 30 Days)</Card.Title>
                                        <div style={{ height: '300px' }}>
                                            {dailyExpensesData.labels && dailyExpensesData.datasets ? (
                                                <Bar
                                                    data={dailyExpensesData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false, // Disable default aspect ratio
                                                        plugins: {
                                                            legend: {
                                                                position: 'top',
                                                            },
                                                            title: {
                                                                display: false,
                                                            },
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                            },
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <p>No expense data available for the last 30 days.</p>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Expense Distribution */}
                            <Col md={6} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Expenses Distribution by Category</Card.Title>
                                        <div style={{ height: '300px' }}>
                                            {expenseDistributionData.labels && expenseDistributionData.datasets && expenseDistributionData.labels.length > 0 ? (
                                                <Pie
                                                    data={expenseDistributionData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false, // Disable default aspect ratio
                                                        plugins: {
                                                            legend: {
                                                                position: 'right',
                                                            },
                                                            title: {
                                                                display: false,
                                                            },
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <p>No expense data available.</p>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Recent Transactions */}
                        <Row className="mt-4 mb-4">
                            <Col>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Recent Transactions</Card.Title>
                                        {transactions.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table striped bordered hover>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Type</th>
                                                            <th>Amount ($)</th>
                                                            <th>Date</th>
                                                            <th>Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions
                                                            .slice(-5)
                                                            .reverse()
                                                            .map((txn, index) => (
                                                                <tr key={txn.id}>
                                                                    <td>
                                                                        {transactions.length -
                                                                            index}
                                                                    </td>
                                                                    <td>
                                                                        {txn.transaction_type.charAt(0).toUpperCase() +
                                                                            txn.transaction_type.slice(1)}
                                                                    </td>
                                                                    <td>{parseFloat(txn.amount).toFixed(2)}</td>
                                                                    <td>{txn.date}</td>
                                                                    <td>
                                                                        {txn.description
                                                                            ? txn.description
                                                                            : 'N/A'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <p>No transactions found.</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}

                {/* Reset Confirmation Modal */}
                <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Reset</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            <strong>Warning:</strong> This action will delete all your data, including transactions and categories. This action cannot be undone. Are you sure you want to proceed?
                        </p>
                        <p>
                            <strong>Recommendation:</strong> Please export your data before resetting to ensure you have a backup.
                        </p>

                        {/* Export Format Selection within Modal */}
                        <Form.Group controlId="exportFormatSelect">
                            <Form.Label>Select Export Format:</Form.Label>
                            <Form.Select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="mb-3"
                            >
                                <option value="json">JSON</option>
                                <option value="csv">CSV</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Export Button within Modal */}
                        <Button
                            variant="info"
                            onClick={handleExport}
                            disabled={exporting}
                            className="mb-3"
                        >
                            {exporting ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Exporting...
                                </>
                            ) : (
                                'Export Data Now'
                            )}
                        </Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowResetModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleReset} disabled={resetting}>
                            {resetting ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Resetting...
                                </>
                            ) : (
                                'Reset All Data'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
    );
};
export default Dashboard;