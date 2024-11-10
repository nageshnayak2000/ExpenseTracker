// src/components/Transactions/TransactionForm.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    Button,
    Container,
    Row,
    Col,
    Card,
    Alert,
    Spinner,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ErrorContext } from '../../context/ErrorContext';

const TransactionForm = () => {
    const navigate = useNavigate();
    const { error, setError, success, setSuccess } = useContext(ErrorContext);

    // State variables for form fields
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('expense');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(null); // New state for date

    // State variables for categories, loading, and validation
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [validated, setValidated] = useState(false);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            const access = localStorage.getItem('access_token');
            try {
                const response = await fetch('/api/categories/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setError('Session expired. Please log in again.');
                        navigate('/login');
                    } else if (response.status >= 500) {
                        setError('Server error. Please try again later.');
                    } else {
                        const errorData = await response.json();
                        setError(
                            errorData.detail ||
                                'Failed to fetch categories. Please try again.'
                        );
                    }
                } else {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                setError(
                    'Network error. Please check your connection and try again.'
                );
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [setError, navigate]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        // Check form validity
        if (form.checkValidity() === false || !date) {
            e.stopPropagation();
            setValidated(true);
            if (!date) {
                setError(
                    `Please select a ${
                        transactionType === 'income' ? 'month and year' : 'date'
                    } for the transaction.`
                );
            }
            // Optionally, focus the first invalid field
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            return;
        }

        setValidated(true);
        setLoadingSubmit(true);
        setError('');
        setSuccess('');

        const access = localStorage.getItem('access_token');

        // Prepare payload
        const payload = {
            amount: parseFloat(amount),
            transaction_type: transactionType,
            description: description.trim() !== '' ? description : null,
            date:
                transactionType === 'income'
                    ? formatDateForIncome(date)
                    : formatDate(date),
        };

        // Include category only if transaction type is 'expense'
        if (transactionType === 'expense') {
            payload.category = category;
        } else {
            payload.category = null; // Ensure category is null for income
        }

        try {
            const response = await fetch('/api/transactions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    // Extract and concatenate all error messages
                    const errorMessages = Object.entries(errorData)
                        .map(([field, messages]) => {
                            if (Array.isArray(messages)) {
                                return `${field}: ${messages.join(', ')}`;
                            }
                            return `${field}: ${messages}`;
                        })
                        .join(' | ');
                    setError(`Failed to add transaction: ${errorMessages}`);
                } else if (response.status === 401) {
                    setError('Unauthorized. Please log in again.');
                    navigate('/login');
                } else {
                    setError(
                        'An unexpected error occurred. Please try again later.'
                    );
                }
            } else {
                setSuccess('Transaction added successfully!');
                // Optionally, reset form fields
                setAmount('');
                setTransactionType('expense');
                setCategory('');
                setDescription('');
                setDate(null);
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (error) {
            setError(
                'Network error. Please check your connection and try again.'
            );
            console.error('Error adding transaction:', error);
        } finally {
            setLoadingSubmit(false);
        }
    };

    // Helper functions to format date
    const formatDate = (dateObj) => {
        return dateObj.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    };

    const formatDateForIncome = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`; // Set to first day of the selected month
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-4">
                                Add Transaction
                            </Card.Title>

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

                            <Form
                                noValidate
                                validated={validated}
                                onSubmit={handleSubmit}
                            >
                                {/* Transaction Type Field */}
                                <Form.Group
                                    controlId="formTransactionType"
                                    className="mb-3"
                                >
                                    <Form.Label>Transaction Type</Form.Label>
                                    <Form.Select
                                        value={transactionType}
                                        onChange={(e) =>
                                            setTransactionType(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Please select a transaction type.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Conditionally Render Category Field for 'expense' */}
                                {transactionType === 'expense' && (
                                    <Form.Group
                                        controlId="formCategory"
                                        className="mb-3"
                                    >
                                        <Form.Label>Category</Form.Label>
                                        {loadingCategories ? (
                                            <div className="d-flex align-items-center">
                                                <Spinner
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    className="me-2"
                                                >
                                                    <span className="visually-hidden">
                                                        Loading...
                                                    </span>
                                                </Spinner>
                                                <span>Loading categories...</span>
                                            </div>
                                        ) : (
                                            <Form.Select
                                                value={category}
                                                onChange={(e) =>
                                                    setCategory(e.target.value)
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Category
                                                </option>
                                                {categories.map((cat) => (
                                                    <option
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        )}
                                        <Form.Control.Feedback type="invalid">
                                            Please select a category.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                )}

                                {/* Date Field */}
                                <Form.Group controlId="formDate" className="mb-3">
                                    <Form.Label>
                                        {transactionType === 'income'
                                            ? 'Month'
                                            : 'Date'}
                                    </Form.Label>
                                    <div>
                                        <DatePicker
                                            selected={date}
                                            onChange={(date) => setDate(date)}
                                            dateFormat={
                                                transactionType === 'income'
                                                    ? 'MMMM yyyy'
                                                    : 'yyyy-MM-dd'
                                            }
                                            className="form-control"
                                            placeholderText={
                                                transactionType === 'income'
                                                    ? 'Select month and year'
                                                    : 'Select date'
                                            }
                                            showMonthYearPicker={
                                                transactionType === 'income'
                                            }
                                            maxDate={new Date()}
                                            required
                                        />
                                    </div>
                                    {!date && validated && (
                                        <div className="invalid-feedback d-block">
                                            Please{' '}
                                            {transactionType === 'income'
                                                ? 'select a month and year'
                                                : 'select a date'}{' '}
                                            for the transaction.
                                        </div>
                                    )}
                                </Form.Group>

                                {/* Amount Field */}
                                <Form.Group
                                    controlId="formAmount"
                                    className="mb-3"
                                >
                                    <Form.Label>Amount ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(e.target.value)
                                        }
                                        required
                                        min="0.01"
                                        step="0.01"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a valid amount greater than
                                        zero.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Description Field */}
                                <Form.Group
                                    controlId="formDescription"
                                    className="mb-3"
                                >
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter description (optional)"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                    />
                                </Form.Group>

                                {/* Submit Button or Spinner */}
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    disabled={loadingSubmit}
                                >
                                    {loadingSubmit ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Transaction'
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TransactionForm;