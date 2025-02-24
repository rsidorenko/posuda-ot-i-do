import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface User {
  _id: string;
  name: string;
  email: string;
  nameChangeCount: number;
  lastNameChange: string;
  role: string;
}

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  authChecked: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authChecked: false,
};

export const login = createAsyncThunk<
  { user: User, token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    return { user, token };
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      return rejectWithValue('Слишком много попыток. Подождите и попробуйте снова.');
    }
    return rejectWithValue('Неверный email или пароль');
  }
});

export const register = createAsyncThunk<
  { user: User, token: string },
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { user, token } = response.data;
    return { user, token };
  } catch (error) {
    return rejectWithValue('Registration failed');
  }
});

export const updateProfileThunk = createAsyncThunk<
  User,
  {
    name: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
  },
  { rejectValue: string }
>('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/profile', data);
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to update profile');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      return rejectWithValue('unauthorized');
    }
    return rejectWithValue('Failed to get user data');
  }
});

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (error) {
      return rejectWithValue('Invalid token');
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk<
  string, // Ожидаем строку с сообщением об успехе
  { email: string },
  { rejectValue: string }
>('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/forgot-password', data);
    return response.data.message; // Предполагаем, что бэкенд возвращает { message: '...' }
  } catch (error: any) {
    // Обрабатываем ошибки HTTP и другие возможные ошибки
    const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка при запросе восстановления пароля.';
    return rejectWithValue(errorMessage);
  }
});

export const verifyResetCodeThunk = createAsyncThunk(
  'auth/verifyResetCode',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-code`, {
        email,
        code
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при проверке кода');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User, token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get user data';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to check authentication';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer; 