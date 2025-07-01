import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faIdCard, faMoneyBillWave, faFilter, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function FilterOrders({ onFilterChange }) {
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false); // State to toggle filter visibility

  const handleFilter = () => {
    const filters = {
      status,
      startDate,
      endDate,
      customerName,
      orderId,
      paymentStatus,
    };
    onFilterChange(filters);
    setShowFilters(false); // Hide filter UI after applying filters
  };

  const handleReset = () => {
    setStatus('');
    setStartDate(null);
    setEndDate(null);
    setCustomerName('');
    setOrderId('');
    setPaymentStatus('');
    onFilterChange({}); // Reset with empty filter object
    setShowFilters(false); // Hide filter UI after resetting
  };

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      // Handle invalid date range (start date cannot be after end date)
      alert('Start date cannot be after end date');
      setStartDate(null);
      setEndDate(null);
    }
  }, [startDate, endDate]);

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
      {/* Filter UI Toggle based on showFilters state */}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', maxHeight: '300px', overflowY: 'auto' }}>
          {/* Order Status */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Order Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Start Date:</label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '8px', color: '#888' }} />
              <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Select start date" style={{ width: '100%', padding: '8px 30px 8px 30px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>End Date:</label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '8px', color: '#888' }} />
              <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="Select end date" style={{ width: '100%', padding: '8px 30px 8px 30px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Customer Name:</label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faUser} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '8px', color: '#888' }} />
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name" style={{ width: '70%', padding: '8px 30px 8px 30px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Order ID:</label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faIdCard} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '8px', color: '#888' }} />
              <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Enter order ID" style={{ width: '70%', padding: '8px 30px 8px 30px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Payment Status:</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={{ width: '80%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
    
      {/* Filter Buttons */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button 
        // onClick={handleFilter}
         style={{ padding: '10px 20px', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Apply Filters
        </button>
        <button 
        // onClick={handleReset}
         style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '5px' }} />
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default FilterOrders;
