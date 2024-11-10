// src/services/api.js

const API_URL = 'http://localhost:8000/api/';

export const registerUser = async (username, password) => {
    const response = await fetch(`${API_URL}users/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    return response.json();
};

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_URL}token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    return response.json();
};

// Add more helper functions as needed
