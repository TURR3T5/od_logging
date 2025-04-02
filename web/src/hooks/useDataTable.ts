import { useState } from 'react';
import { SortingState, ColumnFiltersState, PaginationState } from '@tanstack/react-table';
interface UseDataTableOptions {
  initialSorting?: SortingState;
  initialPagination?: {
    pageSize: number;
    pageIndex: number;
  };
}
export function useDataTable<_T>({ 
  initialSorting = [{ id: 'createdAt', desc: true }],
  initialPagination = { pageSize: 10, pageIndex: 0 }
}: UseDataTableOptions = {}) {
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPagination.pageIndex,
    pageSize: initialPagination.pageSize,
  });
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
    };
    const setPageSize = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size }));
    };
    const resetFiltersAndSorting = () => {
    setColumnFilters([]);
    setGlobalFilter('');
    setSorting(initialSorting);
    };
    const applyFilter = (columnId: string, value: any) => {
    setColumnFilters(prev => {
      const existingFilterIndex = prev.findIndex(filter => filter.id === columnId);
        if (value === '' || value === null || value === undefined) {
      if (existingFilterIndex === -1) return prev;
      return prev.filter((_, i) => i !== existingFilterIndex);
      }
        if (existingFilterIndex !== -1) {
      return prev.map((filter, i) => 
        i === existingFilterIndex 
        ? { ...filter, value } 
        : filter
      );
      }
        return [...prev, { id: columnId, value }];
    });
      setPage(0);
    };
    return {
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
      setPage,
    setPageSize,
    resetFiltersAndSorting,
    applyFilter
    };
}