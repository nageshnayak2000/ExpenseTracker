// src/components/Categories/CategoryForm.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { ErrorContext } from '../../context/ErrorContext';

const CategoryForm = () => {
    const navigate = useNavigate();
    const { error, setError, success, setSuccess } = useContext(ErrorContext);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const access = localStorage.getItem('access_token');
        if (!name.trim()) {
            setError('Category name cannot be empty.');
            return;
        }
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/categories/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                },
                body: JSON.stringify({ name }),
            });
            if (response.ok) {
                setSuccess('Category added successfully!');
                setName('');
                // Redirect to categories page after a short delay
                setTimeout(() => {
                    navigate('/categories');
                }, 1500);
            } else {
                const data = await response.json();
                setError(`Failed to add category: ${formatError(data)}`);
            }
        } catch (error) {
            console.error(error);
            setError('Failed to add category!');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper function to format error messages
    const formatError = (errorData) => {
        return Object.entries(errorData)
            .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                    return `${field}: ${messages.join(', ')}`;
                }
                return `${field}: ${messages}`;
            })
            .join(' | ');
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-4">Add Category</Card.Title>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formCategoryName" className="mb-3">
                                    <Form.Label>Category Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter category name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a category name.
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button variant="success" type="submit" className="w-100" disabled={submitting}>
                                    {submitting ? (
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
            </Row>
        </Container>
    );
};

export default CategoryForm;