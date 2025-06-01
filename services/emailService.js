const axios = require('axios');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Default values in case environment variables are not set
const token = process.env.API_TOKEN || 'default_token';
const BASE_URL = process.env.API_BASE_URL;

// Log the base URL for debugging
console.log('API Base URL:', BASE_URL);

const axiosInstance = axios.create({
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});

const emailService = {
    getEmails: async () => {
        try {
            console.log('Fetching emails from:', BASE_URL);
            const response = await axiosInstance.get(`${BASE_URL}/email`);
            return response.data;
        } catch (error) {
            console.error('Error fetching emails:', error.message);
            throw error;
        }
    },

    getMailDetails: async (mailId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/email/${mailId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching mail details for ID ${mailId}:`, error.message);
            throw error;
        }
    },

    getMessageContent: async (messageId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/message/${messageId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching message content for ID ${messageId}:`, error.message);
            throw error;
        }
    }

};

module.exports = emailService;
