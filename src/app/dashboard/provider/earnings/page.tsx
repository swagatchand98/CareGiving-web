'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProviderHeader from '@/components/layout/ProviderHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import ConnectAccountSetup from '@/components/provider/ConnectAccountSetup';
import { TextField, MenuItem, Select, FormControl, InputLabel, Pagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getPaymentHistory } from '@/services/paymentService';
import { 
  EarningsHistoryItem, 
  EarningsFilters,
  calculateMonthlyEarnings,
  transformPaymentHistoryToEarnings,
  getEarningsSummary,
  getEarningsHistory
} from '@/services/earningsService';

const ProviderEarningsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Earnings data
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<{ month: string; amount: number }[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<EarningsHistoryItem[]>([]);
  
  // Filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Check if user is authenticated and is a provider
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/dashboard/provider/earnings');
      } else if (user?.role !== 'provider') {
        router.push('/dashboard');
      } else {
        fetchEarningsData();
      }
    }
  }, [user, authLoading, router, isAuthenticated]);
  
  // Fetch earnings data from API
  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get earnings summary from API
        const summary = await getEarningsSummary();
        
        // Update state with summary data
        setTotalEarnings(summary.totalEarnings);
        setPendingPayouts(summary.pendingPayouts);
        setCompletedBookings(summary.completedBookings);
        setMonthlyEarnings(summary.monthlyEarnings);
      } catch (summaryError) {
        console.error('Error fetching earnings summary:', summaryError);
        
        // Fallback to payment history if earnings summary API fails
        const paymentHistoryResponse = await getPaymentHistory();
        const payments = paymentHistoryResponse.payments || [];
        
        // Calculate total earnings and pending payouts
        let total = 0;
        let pending = 0;
        let completed = 0;
        
        payments.forEach(payment => {
          if (payment.type === 'BOOKING') {
            if (payment.status === 'COMPLETED') {
              total += payment.providerAmount;
              completed++;
            } else if (payment.status === 'PENDING') {
              pending += payment.providerAmount;
            }
          } else if (payment.type === 'REFUND') {
            // Subtract refunds from total earnings
            total -= Math.abs(payment.providerAmount);
          }
        });
        
        // Calculate monthly earnings
        const monthly = calculateMonthlyEarnings(payments);
        
        // Update state with calculated values
        setTotalEarnings(total);
        setPendingPayouts(pending);
        setCompletedBookings(completed);
        setMonthlyEarnings(monthly);
      }
      
      // Get earnings history
      try {
        const historyResponse = await getEarningsHistory();
        setEarningsHistory(historyResponse.earnings);
        setTotalPages(Math.ceil(historyResponse.totalCount / itemsPerPage));
      } catch (historyError) {
        console.error('Error fetching earnings history:', historyError);
        
        // Fallback to payment history if earnings history API fails
        const paymentHistoryResponse = await getPaymentHistory();
        const payments = paymentHistoryResponse.payments || [];
        
        // Transform payment history to earnings history format
        const history = transformPaymentHistoryToEarnings(payments);
        
        // Update state with history data
        setEarningsHistory(history);
        setTotalPages(Math.ceil(history.length / itemsPerPage));
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching earnings data:', err);
      setError(err.message || 'Failed to load earnings data');
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle filter changes
  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
  };

  const handleServiceFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setServiceFilter(event.target.value as string);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Apply filters
  const applyFilters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create filters object
      const filters: EarningsFilters = {
        startDate,
        endDate,
        status: statusFilter,
        serviceType: serviceFilter,
        page: 1,
        limit: itemsPerPage * totalPages // Get all results to handle client-side pagination
      };
      
      try {
        // Get filtered earnings history from API
        const historyResponse = await getEarningsHistory(filters);
        setEarningsHistory(historyResponse.earnings);
        setTotalPages(Math.ceil(historyResponse.totalCount / itemsPerPage));
        setPage(1); // Reset to first page
      } catch (historyError) {
        console.error('Error fetching filtered earnings history:', historyError);
        
        // Fallback to client-side filtering if API fails
        const paymentHistoryResponse = await getPaymentHistory();
        const payments = paymentHistoryResponse.payments || [];
        
        // Filter payments based on selected filters
        let filteredPayments = [...payments];
        
        // Apply date filters
        if (startDate) {
          filteredPayments = filteredPayments.filter(payment => 
            new Date(payment.createdAt) >= startDate
          );
        }
        
        if (endDate) {
          filteredPayments = filteredPayments.filter(payment => 
            new Date(payment.createdAt) <= endDate
          );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
          filteredPayments = filteredPayments.filter(payment => 
            payment.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }
        
        // Apply service filter
        if (serviceFilter !== 'all') {
          filteredPayments = filteredPayments.filter(payment => {
            const serviceType = payment.bookingId?.serviceId?.type;
            return serviceType && serviceType.toLowerCase() === serviceFilter.toLowerCase();
          });
        }
        
        // Transform filtered payments to earnings history format
        const filteredHistory = transformPaymentHistoryToEarnings(filteredPayments);
        
        // Update state with filtered data
        setEarningsHistory(filteredHistory);
        setTotalPages(Math.ceil(filteredHistory.length / itemsPerPage));
        setPage(1); // Reset to first page
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error applying filters:', err);
      setError(err.message || 'Failed to apply filters');
      setIsLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatusFilter('all');
    setServiceFilter('all');
    fetchEarningsData(); // Reload original data
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated, show a message or redirect
  if (!isAuthenticated) {
    return null; // We'll redirect in the useEffect hook
  }
  
  // Ensure user is not null before rendering
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ProviderHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Earnings</h1>
              <p className="text-gray-600">Track your earnings and payment history</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/provider')}
              variant="outline"
              className="px-6 py-2"
            >
              Back to Dashboard
            </Button>
          </div>
          
          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
              <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Pending Payouts</h3>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(pendingPayouts)}</p>
              <p className="text-sm text-gray-500 mt-1">To be processed</p>
              {pendingPayouts > 0 && (
                <Button 
                  onClick={() => document.getElementById('connect-account-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-3 text-sm py-1"
                  variant="primary"
                >
                  Request Payout
                </Button>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Completed Bookings</h3>
              <p className="text-3xl font-bold">{completedBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Total services completed</p>
            </div>
          </div>
          
          {/* Connect Account Setup */}
          <div id="connect-account-section" className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Stripe Connect Account</h2>
            <p className="text-gray-600 mb-4">
              Connect your Stripe account to receive payments directly to your bank account.
              You can set up automatic payouts or request manual payouts when you need them.
            </p>
            <ConnectAccountSetup />
          </div>
          
          {/* Earnings Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Monthly Earnings</h2>
            <div className="h-64 flex items-end justify-between space-x-2">
              {monthlyEarnings.map((item, index) => {
                // Calculate height percentage based on max value
                const maxAmount = Math.max(...monthlyEarnings.map(e => e.amount));
                const heightPercentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    <div className="mt-2 text-xs font-medium">{item.month}</div>
                    <div className="text-xs text-gray-500">{formatCurrency(item.amount)}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Earnings History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Earnings History</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
                <Button 
                  onClick={fetchEarningsData} 
                  className="mt-2 text-sm py-2 px-3"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}
            
            {/* Filters */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium mb-3">Filter Transactions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <div>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </div>
                  <div>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </div>
                </LocalizationProvider>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl fullWidth size="small">
                  <InputLabel id="status-filter-label">Payment Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    label="Payment Status"
                    onChange={handleStatusFilterChange as any}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel id="service-filter-label">Service Type</InputLabel>
                  <Select
                    labelId="service-filter-label"
                    id="service-filter"
                    value={serviceFilter}
                    label="Service Type"
                    onChange={handleServiceFilterChange as any}
                  >
                    <MenuItem value="all">All Services</MenuItem>
                    <MenuItem value="elderly-care">Elderly Care</MenuItem>
                    <MenuItem value="child-care">Child Care</MenuItem>
                    <MenuItem value="special-needs">Special Needs Care</MenuItem>
                  </Select>
                </FormControl>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
            
            {/* Transactions Table */}
            <div className="overflow-x-auto">
              {earningsHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No earnings history found.</p>
                </div>
              ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earningsHistory
                    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                    .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'refunded'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              )}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * itemsPerPage, earningsHistory.length)}
                </span>{" "}
                of <span className="font-medium">{earningsHistory.length}</span> results
              </div>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="medium"
                showFirstButton 
                showLastButton
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProviderEarningsPage;
