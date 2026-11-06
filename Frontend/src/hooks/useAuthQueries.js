import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';


export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials) => axiosClient.post('/auth/login', credentials),
    onSuccess: () => {
      queryClient.clear(); // Wipe any previous user's cached leads
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axiosClient.post('/auth/logout'),
    onSuccess: () => { 
      queryClient.clear();
    }
  });
};