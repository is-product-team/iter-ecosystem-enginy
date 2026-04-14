import api, { login } from './api';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    })),
  };
});

describe('API Service', () => {
  const mockPost = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (api.post as jest.Mock) = mockPost;
  });

  it('should call login endpoint with correct data', async () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    mockPost.mockResolvedValueOnce({ data: { token: 'mock-token' } });

    await login(loginData);

    expect(mockPost).toHaveBeenCalledWith('auth/login', loginData);
  });

  it('should handle API errors', async () => {
    const loginData = { email: 'test@example.com', password: 'wrong' };
    mockPost.mockRejectedValueOnce(new Error('Unauthorized'));

    await expect(login(loginData)).rejects.toThrow('Unauthorized');
  });
});
