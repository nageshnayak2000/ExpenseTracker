// src/components/Categories/DeleteCategoryButton.js

import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const DeleteCategoryButton = ({
    category,
    onDelete,
    deletingId,
    setDeletingId,
    setError,
    setSuccess,
}) => {
    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        setDeletingId(category.id);
        const access = localStorage.getItem('access_token');

        try {
            const response = await fetch(`/api/categories/${category.id}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                },
            });

            if (response.status === 204) {
                setSuccess(`Category "${category.name}" deleted successfully.`);
                onDelete(); // Refresh the category list
            } else {
                const errorData = await response.json();
                setError(
                    errorData.detail ||
                        'Failed to delete category. Please try again.'
                );
            }
        } catch (error) {
            setError(
                'Network error. Please check your connection and try again.'
            );
            console.error('Error deleting category:', error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deletingId === category.id}
        >
            {deletingId === category.id ? (
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
    );
};

DeleteCategoryButton.propTypes = {
    category: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    deletingId: PropTypes.number,
    setDeletingId: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setSuccess: PropTypes.func.isRequired,
};

export default DeleteCategoryButton;