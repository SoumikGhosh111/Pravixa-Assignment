import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginMutation } from '../hooks/useAuthQueries';
import { axiosClient } from '../api/axiosClient';

export default function LoginPage() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loginMutation = useLoginMutation();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async () => {
          try {
            // Fetch the exact same endpoint that runs on page refresh
            const meResponse = await axiosClient.get('/auth/me');
            setUser(meResponse.data);
            navigate('/');
          } catch (err) {
            setError('Failed to load user profile.');
          }
        },
        onError: (err) => {
          setError(err.response?.data?.message || 'Invalid email or password');
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to PravixaCRM</h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your required Admin or Sales Agent dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              placeholder="agent@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
          >
            {loginMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 rounded-lg bg-slate-50 p-4 text-xs text-slate-500 border border-slate-200">
          <p className="font-semibold text-slate-700 mb-1">Testing Credentials:</p>
          <ul className="space-y-1">
            <li>Admin: <span className="font-mono bg-slate-200 px-1 rounded">admin1@pravixa.com</span> / password123</li>
            <li>Agent: <span className="font-mono bg-slate-200 px-1 rounded">agent1@pravixa.com</span> / password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}