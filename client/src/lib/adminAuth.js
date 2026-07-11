import axios from 'axios'
import { loginUser, registerUser } from '../services/authApi'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function authError(err, fallback) {
  return err.response?.data?.message || err.response?.data?.error || err.message || fallback
}

/** Login and ensure the account has the admin role. Returns full session { user, accessToken }. */
export async function adminLogin({ email, password }) {
  try {
    const data = await loginUser({ email, password })
    if (data.user?.role !== 'admin') {
      throw new Error("This account doesn't have admin access.")
    }
    return data
  } catch (err) {
    if (err.message?.includes("doesn't have admin access")) throw err
    throw new Error(authError(err, 'Login failed. Try again.'))
  }
}

/** Register an admin account with invite code. Does not auto-login. */
export async function adminRegister({ name, email, password, inviteCode }) {
  try {
    const { data } = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
      role: 'admin',
      inviteCode,
    }, { withCredentials: true })
    return data
  } catch (err) {
    // Prefer axios path; also support fetch-style errors from registerUser if swapped later
    throw new Error(authError(err, 'Registration failed. Try again.'))
  }
}

// Keep registerUser available if backend is called through the shared helper elsewhere
export { registerUser }
