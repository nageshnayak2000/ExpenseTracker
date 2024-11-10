// src/components/Dashboard/ConfirmResetModal.js

import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ConfirmResetModal = ({ show, handleClose, handleConfirm, resetting }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Reset</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <strong>Warning:</strong> This action will delete all your data, including transactions and categories. This action cannot be undone. Are you sure you want to proceed?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirm} disabled={resetting}>
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
    );
};

ConfirmResetModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    resetting: PropTypes.bool.isRequired,
};

export default ConfirmResetModal;