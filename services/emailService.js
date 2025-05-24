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
    }, 
    getCode: async (userEmail, service) => {
        try {
            // Get all emails
            const response = await emailService.getEmails();

            // Kiểm tra định dạng phản hồi hợp lệ
            if (!response || !response.success || !response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format from getEmails');
            }

            // Tìm email khớp
            const matchingEmail = response.data.find(item =>
                item.email && item.email.toLowerCase() === userEmail.toLowerCase()
            );

            if (!matchingEmail) {
                throw new Error(`No matching email found for ${userEmail}`);
            }

            const mailId = matchingEmail.id;
            const mailDetailsResponse = await emailService.getMailDetails(mailId);
            const items = mailDetailsResponse?.data?.items || [];

            // Filter by service if provided
            const filteredItems = service
                ? items.filter(item => item.subject && item.subject.toLowerCase().includes(service.toLowerCase()))
                : items;

            return {
                success: true,
                data: filteredItems
            };
        } catch (error) {
            console.error(`Error getting code for email ${userEmail}:`, error.message);
            return {
                success: false,
                message: error.message
            };
        }
    }


};

module.exports = emailService;
