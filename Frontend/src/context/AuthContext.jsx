import { createContext, useContext, useState, useEffect } from 'react';
import { axiosClient } from '../api/axiosClient';
import { useLogoutMutation} from '../hooks/useAuthQueries'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await axiosClient.get('/auth/me');
        setUser(response.data); 
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

const logoutMutation = useLogoutMutation();

const handleLogout = () => {
  logoutMutation.mutate(undefined, {
    onSuccess: () => {
      setUser(null); // Clear user state
      navigate('/login'); // Redirect to login
    }
  });
};

  return (
    <AuthContext.Provider value={{ user, setUser, logout: handleLogout, loading }}>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);