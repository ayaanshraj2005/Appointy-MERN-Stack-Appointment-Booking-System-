import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 8

  useEffect(() => {
    const load = async () => {
      if (aToken) {
        setLoading(true)
        await getAllAppointments()
        setLoading(false)
      }
    }
    load()
  }, [aToken])

  // Filter Logic
  const filtered = appointments.filter(item => {
    const patientName = item.userData?.name || ''
    const doctorName = item.docData?.name || ''
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter === 'Completed') {
      matchesStatus = item.isCompleted && !item.cancelled
    } else if (statusFilter === 'Cancelled') {
      matchesStatus = item.cancelled
    } else if (statusFilter === 'Pending') {
      matchesStatus = !item.isCompleted && !item.cancelled
    }

    return matchesSearch && matchesStatus
  })

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  if (loading) {
    return (
      <div className='w-full max-w-6xl m-6 animate-pulse space-y-4'>
        <div className='h-8 bg-gray-200 rounded w-1/4'></div>
        <div className='h-12 bg-gray-200 rounded-xl w-full'></div>
        <div className='h-96 bg-gray-200 rounded-2xl w-full'></div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl m-6 space-y-6 text-[#2C3E50]'>
      
      <div>
        <h2 className='text-2xl font-bold text-gray-800'>Appointments Log</h2>
        <p className='text-xs text-gray-400 mt-0.5'>Manage patient bookings, cancel records, and monitor statuses.</p>
      </div>

      {/* Control Bar (Search & Filter) */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-sm'>
        
        {/* Search */}
        <div className='relative flex-1 max-w-md'>
          <input 
            type="text" 
            placeholder="Search by patient or doctor name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors'
          />
          <span className='absolute left-3.5 top-3 text-gray-400 text-sm'>🔍</span>
        </div>

        {/* Filter Buttons */}
        <div className='flex gap-1.5 overflow-x-auto pb-1 md:pb-0'>
          {['All', 'Pending', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === status 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden'>
        
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50/50 border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
                <th className='py-4 px-6 text-center w-12'>#</th>
                <th className='py-4 px-6'>Patient</th>
                <th className='py-4 px-6 text-center'>Age</th>
                <th className='py-4 px-6'>Date & Time</th>
                <th className='py-4 px-6'>Assigned Doctor</th>
                <th className='py-4 px-6 text-right'>FEE</th>
                <th className='py-4 px-6 text-center'>Status</th>
                <th className='py-4 px-6 text-center'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50 text-sm text-gray-600'>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className='py-16 text-center space-y-2'>
                    <div className='text-3xl'>🗂️</div>
                    <p className='text-gray-400 font-medium'>No appointments match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                  return (
                    <tr key={item._id} className='hover:bg-gray-50/40 transition-colors'>
                      <td className='py-4 px-6 text-center font-semibold text-gray-400'>{globalIndex}</td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-3'>
                          <img src={item.userData.image} className='w-9 h-9 rounded-xl object-cover bg-gray-100 border border-gray-100 shadow-sm' alt="" /> 
                          <span className='font-bold text-gray-800'>{item.userData.name}</span>
                        </div>
                      </td>
                      <td className='py-4 px-6 text-center'>{calculateAge(item.userData.dob)} yrs</td>
                      <td className='py-4 px-6'>
                        <div className='font-medium text-gray-800'>{slotDateFormat(item.slotDate)}</div>
                        <div className='text-xs text-gray-400 mt-0.5'>{item.slotTime}</div>
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-3'>
                          <img src={item.docData.image} className='w-9 h-9 rounded-xl object-cover bg-gray-100 border border-gray-100 shadow-sm' alt="" /> 
                          <span className='font-bold text-gray-800'>{item.docData.name}</span>
                        </div>
                      </td>
                      <td className='py-4 px-6 text-right font-extrabold text-gray-800'>{currency}{item.amount}</td>
                      <td className='py-4 px-6 text-center'>
                        {item.cancelled ? (
                          <span className='px-2.5 py-1 bg-rose-50 text-rose-500 text-[10px] font-bold uppercase rounded-full border border-rose-100'>
                            Cancelled
                          </span>
                        ) : item.isCompleted ? (
                          <span className='px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-100'>
                            Completed
                          </span>
                        ) : (
                          <span className='px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full border border-blue-100'>
                            Active
                          </span>
                        )}
                      </td>
                      <td className='py-4 px-6 text-center'>
                        {!item.cancelled && !item.isCompleted ? (
                          <button 
                            onClick={() => cancelAppointment(item._id)} 
                            className='inline-flex items-center justify-center p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-100 transition-all shadow-sm'
                            title="Cancel Booking"
                          >
                            <img className='w-4 h-4 object-contain invert-[0.3] hover:invert-0' src={assets.cancel_icon} alt="" />
                          </button>
                        ) : (
                          <span className='text-gray-300'>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {filtered.length > itemsPerPage && (
          <div className='flex items-center justify-between px-6 py-4 border-t border-gray-50 bg-gray-50/50 text-xs font-semibold text-gray-500'>
            <p>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} logs</p>
            <div className='flex gap-1.5'>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className='px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

export default AllAppointments