import { useState, useCallback } from 'react';
import { SortingState, ColumnFiltersState, PaginationState } from '@tanstack/react-table';

interface UseDataTableOptions {
  initialSorting?: SortingState;
  initialPagination?: {
    pageSize: number;
    pageIndex: number;
  };
}

export function useDataTable<T>({ 
  initialSorting = [{ id: 'createdAt', desc: true }],
  initialPagination = { pageSize: 10, pageIndex: 0 }
}: UseDataTableOptions = {}) {
  // Sorting
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  
  // Filtering
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPagination.pageIndex,
    pageSize: initialPagination.pageSize,
  });
  
  // Selected rows
  const [rowSelection, setRowSelection] = useState({});
  
  // Data loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Set page
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
  }, []);
  
  // Set page size
  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size }));
  }, []);
  
  // Reset filters and sorting
  const resetFiltersAndSorting = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter('');
    setSorting(initialSorting);
  }, [initialSorting]);
  
  // Apply filter
  const applyFilter = useCallback((columnId: string, value: any) => {
    setColumnFilters(prev => {
      const existingFilterIndex = prev.findIndex(filter => filter.id === columnId);
      
      // If the value is empty or null, remove the filter
      if (value === '' || value === null || value === undefined) {
        if (existingFilterIndex === -1) return prev;
        return prev.filter((_, i) => i !== existingFilterIndex);
      }
      
      // If filter already exists, update it
      if (existingFilterIndex !== -1) {
        return prev.map((filter, i) => 
          i === existingFilterIndex 
            ? { ...filter, value } 
            : filter
        );
      }
      
      // Otherwise add a new filter
      return [...prev, { id: columnId, value }];
    });
    
    // Reset to first page when filtering
    setPage(0);
  }, [setPage]);
  
  return {
    // State
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    rowSelection,
    setRowSelection,
    isLoading,
    setIsLoading,
    
    // Helpers
    setPage,
    setPageSize,
    resetFiltersAndSorting,
    applyFilter
  };
}