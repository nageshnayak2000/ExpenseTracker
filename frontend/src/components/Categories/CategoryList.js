// src/components/Categories/CategoriesList.js

import React, { useEffect, useState, useContext } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Spinner,
    Alert,
    Button,
    Table,
    Form,
} from 'react-bootstrap';
import { ErrorContext } from '../../context/ErrorContext';
import DeleteCategoryButton from './DeleteCategoryButton';

const CategoriesList = () => {
    const { error, setError, success, setSuccess } = useContext(ErrorContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // State for Add Category Form
    const [newCategoryName, setNewCategoryName] = useState('');
    const [adding, setAdding] = useState(false);

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
                    // Redirect to login if necessary
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
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();

        // Basic validation
        if (newCategoryName.trim() === '') {
            setError('Category name cannot be empty.');
            return;
        }

        setAdding(true);
        const access = localStorage.getItem('access_token');

        try {
            const response = await fetch('/api/categories/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                },
                body: JSON.stringify({ name: newCategoryName.trim() }),
            });

            if (response.status === 201) {
                const addedCategory = await response.json();
                setSuccess(`Category "${addedCategory.name}" added successfully.`);
                setNewCategoryName(''); // Reset the form
                fetchCategories(); // Refresh the categories list
            } else {
                const errorData = await response.json();
                // Handle specific validation errors
                if (errorData.name) {
                    setError(errorData.name.join(' '));
                } else {
                    setError(
                        errorData.detail ||
                            'Failed to add category. Please try again.'
                    );
                }
            }
        } catch (error) {
            setError(
                'Network error. Please check your connection and try again.'
            );
            console.error('Error adding category:', error);
        } finally {
            setAdding(false);
        }
    };

    return (
            <Container className="mt-4">
                <Row>
                    <Col>
                        <h2>Manage Categories</h2>
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

                <Row className="mt-4">
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Add New Category</Card.Title>
                                <Form onSubmit={handleAddCategory}>
                                    <Form.Group controlId="formCategoryName" className="mb-3">
                                        <Form.Label>Category Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter category name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" disabled={adding}>
                                        {adding ? (
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
                                            'Add Category'
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Your Categories</Card.Title>
                                {loading ? (
                                    <div className="text-center my-3">
                                        <Spinner
                                            animation="border"
                                            variant="primary"
                                            role="status"
                                        >
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </div>
                                ) : (
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.length > 0 ? (
                                                categories.map((category, index) => (
                                                    <tr key={category.id}>
                                                        <td>{index + 1}</td>
                                                        <td>{category.name}</td>
                                                        <td>
                                                            <DeleteCategoryButton
                                                                category={category}
                                                                onDelete={() =>
                                                                    fetchCategories()
                                                                }
                                                                deletingId={deletingId}
                                                                setDeletingId={setDeletingId}
                                                                setError={setError}
                                                                setSuccess={setSuccess}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center">
                                                        No categories found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
    );

}
export default CategoriesList;