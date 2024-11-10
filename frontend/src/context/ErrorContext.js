// src/context/ErrorContext.js

import React, { createContext, useState } from 'react';

export const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    return (
        <ErrorContext.Provider value={{ error, setError, success, setSuccess, clearMessages }}>
            {children}
        </ErrorContext.Provider>
    );
};