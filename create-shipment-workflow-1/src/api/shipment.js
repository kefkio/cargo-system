import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Function to create a new shipment
export const createShipment = async (shipmentData) => {
  try {
    const response = await axios.post(`${API_URL}/shipments/`, shipmentData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create shipment');
  }
};