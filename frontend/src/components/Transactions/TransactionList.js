// src/components/Transactions/TransactionList.js

import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Button, Table, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DeleteTransactionButton from './DeleteTransactionButton';
import { ErrorContext } from '../../context/ErrorContext';
const TransactionList = () => {
    const { error, setError, success, setSuccess } = useContext(ErrorContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            const access = localStorage.getItem('access_token');
            try {
                const response = await fetch('/api/transactions/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.detail || 'Failed to fetch transactions.');
                } else {
                    const data = await response.json();
                    setTransactions(data);
                }
            } catch (error) {
                setError('An unexpected error occurred while fetching transactions.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [setError]);

    const handleDelete = (deletedId) => {
        setTransactions(transactions.filter(txn => txn.id !== deletedId));
    };

    return (
            <Container className="mt-4">
                <Row className="mb-3">
                    <Col>
                        <h2>Your Transactions</h2>
                    </Col>
                    <Col className="text-end">
                        <Link to="/transactions/add">
                            <Button variant="primary">Add Transaction</Button>
                        </Link>
                    </Col>
                </Row>
                <Card>
                    <Card.Body>
                        {error && (
                            <Alert
                                variant="danger"
                                onClose={() => setError('')}
                                dismissible
                            >
                                {error}
                            </Alert>
                        )}
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
                            <div className="text-center">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : transactions.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Type</th>
                                        <th>Amount ($)</th>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn, index) => (
                                        <tr key={txn.id}>
                                            <td>{index + 1}</td>
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
                                            <td>
                                                <DeleteTransactionButton
                                                    transaction={txn}
                                                    onDelete={handleDelete}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p>No transactions found. Start by adding a new transaction.</p>
                        )}
                    </Card.Body>
                </Card>
            </Container>
    );
};

export default TransactionList;