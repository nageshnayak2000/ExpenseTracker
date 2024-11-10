// src/components/Transactions/DeleteTransactionButton.js

import React, { useState, useContext } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { ErrorContext } from '../../context/ErrorContext';

const DeleteTransactionButton = ({ transaction, onDelete }) => {
    const { setError, setSuccess } = useContext(ErrorContext);
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await fetch(`/api/transactions/${transaction.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.status === 204) {
                setSuccess('Transaction deleted successfully.');
                onDelete(transaction.id);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete transaction.');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            setError(error.message || 'An error occurred while deleting the transaction.');
        } finally {
            setDeleting(false);
            setShowModal(false);
        }
    };

    return (
        <>
            <Button variant="danger" size="sm" onClick={() => setShowModal(true)}>
                Delete
            </Button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the transaction for <strong>${transaction.amount}</strong> on <strong>{transaction.date}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DeleteTransactionButton;