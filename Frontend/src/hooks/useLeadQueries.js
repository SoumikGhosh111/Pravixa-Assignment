import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';

export const useLeadsQuery = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await axiosClient.get('/lead/get-lead');
      return response.data;
    },
    // enabled: Boolean(userId), 
  });
};

export const useCreateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLeadData) => {
      const response = await axiosClient.post('/lead/create-lead', newLeadData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useUpdateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, updateData }) => {
      const response = await axiosClient.post(`/lead/${leadId}/update-lead`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useUpdateLeadStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, stage }) => {
      // Matches your backend route: router.post('/:leadId/update-lead', ...)
      const response = await axiosClient.post(`/lead/${leadId}/update-lead`, { stage });
      return response?.data || response;
    },
    onSuccess: (_, variables) => {
      // Refresh the lead table and the specific lead's activity timeline
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', variables.leadId] });
    },
  });
};


export const useLeadActivitiesQuery = (leadId, enabled = false) => {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      // Adjust endpoint if your backend returns timeline on GET /leads/:id or GET /leads/:id/activities
      const response = await axiosClient.get(`/lead/${leadId}/get-lead-by-id`);
      return response?.timeline ? response : response.data;
    },
    enabled: Boolean(leadId) && enabled,
  });
};

// Add a note to a lead's activity timeline
export const useAddLeadNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, text }) => {
      // Adjust to '/leads/${leadId}/activities' if that matches your backend route
      const response = await axiosClient.post(`/lead/${leadId}/notes`, {
        text,
        note: text,
        description: text,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useDeleteLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId) => {
      const response = await axiosClient.delete(`/lead/${leadId}/delete-lead`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};


export const useConvertLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, projectName, projectDetails, agreedAmount }) => {
      const response = await axiosClient.post(`/lead/${leadId}/update-lead`, {
        stage: 'Won',
        isClient: true,
        projectName,
        projectDetails,
        agreedAmount: Number(agreedAmount),
      });
      return response?.data || response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', variables.leadId] });
    },
  });
};

export const useClientsQuery = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await axiosClient.get('/lead/get-lead');
      return response?.data || response;
    },
  });
};