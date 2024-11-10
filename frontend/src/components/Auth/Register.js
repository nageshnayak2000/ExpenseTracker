// src/components/Auth/Register.js

import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { ErrorContext } from '../../context/ErrorContext';

const Register = () => {
    const navigate = useNavigate();
    const { error, setError, success, setSuccess } = useContext(ErrorContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registering, setRegistering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegistering(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setRegistering(false);
            return;
        }

        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.status === 201) {
                setSuccess('Registration successful! You can now log in.');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                const errorData = await response.json();
                // Handle specific validation errors
                if (errorData.username) {
                    setError(errorData.username.join(' '));
                } else if (errorData.password) {
                    setError(errorData.password.join(' '));
                } else {
                    setError(
                        errorData.detail ||
                            'Failed to register. Please try again.'
                    );
                }
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
            console.error('Error during registration:', error);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Register</Card.Title>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formBasicUsername" className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword" className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" disabled={registering} className="w-100">
                                    {registering ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Registering...
                                        </>
                                    ) : (
                                        'Register'
                                    )}
                                </Button>
                            </Form>
                            <div className="mt-3 text-center">
                                Already have an account? <Link to="/login">Login here</Link>.
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;