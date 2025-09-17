import { create } from 'zustand';

const useSearchStore = create((set, get) => ({
  query: '',
  results: [],
  isLoading: false,
  filters: {
    type: 'all',
    location: '',
    dateRange: 'all',
    quality: 'all'
  },
  
  setQuery: (query) => {
    set({ query });
    // Auto-search if query length > 2
    if (query.length > 2) {
      get().performSearch();
    } else if (query.length === 0) {
      set({ results: [] });
    }
  },
  
  setFilters: (filters) => {
    set(state => ({ 
      filters: { ...state.filters, ...filters }
    }));
    if (get().query) {
      get().performSearch();
    }
  },
  
  performSearch: async () => {
    const { query, filters } = get();
    set({ isLoading: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock search logic - in real app this would call API
    const mockData = await import('../mock/data.js');
    const { datasets, users, alerts } = mockData;
    
    let results = [];
    
    // Search datasets
    if (filters.type === 'all' || filters.type === 'datasets') {
      const datasetResults = datasets.filter(dataset => 
        dataset.name.toLowerCase().includes(query.toLowerCase()) ||
        dataset.location.toLowerCase().includes(query.toLowerCase()) ||
        dataset.parameters.some(param => param.toLowerCase().includes(query.toLowerCase()))
      ).map(item => ({ ...item, type: 'dataset' }));
      results.push(...datasetResults);
    }
    
    // Search users (admin only)
    if (filters.type === 'all' || filters.type === 'users') {
      const userResults = users.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.institution.toLowerCase().includes(query.toLowerCase())
      ).map(item => ({ ...item, type: 'user' }));
      results.push(...userResults);
    }
    
    // Search alerts
    if (filters.type === 'all' || filters.type === 'alerts') {
      const alertResults = alerts.filter(alert =>
        alert.type.toLowerCase().includes(query.toLowerCase()) ||
        alert.location.toLowerCase().includes(query.toLowerCase()) ||
        alert.description.toLowerCase().includes(query.toLowerCase())
      ).map(item => ({ ...item, type: 'alert' }));
      results.push(...alertResults);
    }
    
    // Apply additional filters
    if (filters.location) {
      results = results.filter(item => 
        item.location && item.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.quality !== 'all') {
      results = results.filter(item => item.quality === filters.quality);
    }
    
    set({ results, isLoading: false });
  },
  
  clearSearch: () => {
    set({ 
      query: '', 
      results: [], 
      isLoading: false,
      filters: {
        type: 'all',
        location: '',
        dateRange: 'all',
        quality: 'all'
      }
    });
  }
}));

export default useSearchStore;
