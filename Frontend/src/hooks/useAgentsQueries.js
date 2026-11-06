import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';

export const useAgentsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await axiosClient.get('/user/get-agents');
      return response.data;
    },
    enabled, 
  });
};