import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

/**
 * Format a date for display
 */
export const formatDate = (date: string | Date | null | undefined, formatString: string = 'd. MMMM yyyy'): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatString, { locale: da });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a datetime for display
 */
export const formatDateTime = (date: string | Date | null | undefined, formatString: string = 'd. MMMM yyyy, HH:mm'): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatString, { locale: da });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid date';
  }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('da-DK', { 
    style: 'currency', 
    currency: 'DKK' 
  }).format(amount);
};

/**
 * Format a number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('da-DK').format(num);
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Truncate a string to a specific length
 */
export const truncateString = (str: string, maxLength: number = 100): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Show a notification for API actions
 */
export const showNotification = (
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  message: string
) => {
  const colors = {
    success: 'green',
    error: 'red',
    info: 'blue',
    warning: 'yellow'
  };
  
  notifications.show({
    title,
    message,
    color: colors[type]
  });
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: any, operation: string): void => {
  console.error(`Error ${operation}:`, error);
  
  const errorMessage = error?.message || 'Der opstod en uventet fejl';
  
  showNotification(
    'error',
    'Fejl',
    `Der opstod en fejl under ${operation}. ${errorMessage}`
  );
};

/**
 * Export data to CSV
 */
export const exportToCsv = (data: any[], filename: string): void => {
  if (!data.length) {
    showNotification('warning', 'Eksport Fejl', 'Ingen data at eksportere');
    return;
  }
  
  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers
        .map(header => {
          const cell = row[header] ?? '';
          // If the cell contains commas, quotes, or newlines, enclose it in quotes
          return typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
            ? `"${cell.replace(/"/g, '""')}"` // Escape quotes
            : cell;
        })
        .join(',')
    )
  ].join('\n');
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification('success', 'Eksport fuldført', 'Data er blevet eksporteret til CSV-fil');
};

/**
 * Export data to JSON
 */
export const exportToJson = (data: any, filename: string): void => {
  if (!data) {
    showNotification('warning', 'Eksport Fejl', 'Ingen data at eksportere');
    return;
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification('success', 'Eksport fuldført', 'Data er blevet eksporteret til JSON-fil');
};

/**
 * Parse a date string from a form input
 */
export const parseFormDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  // Try to parse the date
  const date = new Date(dateString);
  
  // Check if the date is valid
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'Der opstod en uventet fejl';
};