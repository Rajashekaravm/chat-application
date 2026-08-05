import API from '../api/axiosConfig';

export const registerUser = async (data) => {
  return await API.post('/auth/register', data);
};

export const sendOtp = async (data) => {
  return await API.post('/auth/otp/send', data);
};

export const verifyOtp = async (data) => {
  return await API.post('/auth/otp/verify', data);
};