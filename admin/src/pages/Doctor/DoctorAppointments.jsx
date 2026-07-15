import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 8

  useEffect(() => {
    const load = async () => {
      if (dToken) {
        setLoading(true)
        await getAppointments()
        setLoading(false)
      }
    }
    load()
  }, [dToken])

  // Filter Logic
  const filtered = appointments.filter(item => {
    const patientName = item.userData?.name || ''
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter === 'Completed') {
      matchesStatus = item.isCompleted && !item.cancelled
    } else if (statusFilter === 'Cancelled') {
      matchesStatus = item.cancelled
    } else if (statusFilter === 'Pending') {
      matchesStatus = !item.isCompleted && !item.cancelled
    }

    let matchesPayment = true
    if (paymentFilter === 'Online') {
      matchesPayment = item.payment
    } else if (paymentFilter === 'Cash') {
      matchesPayment = !item.payment
    }

    return matchesSearch && matchesStatus && matchesPayment
  })

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, paymentFilter])

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
        <h2 className='text-2xl font-bold text-gray-800'>My Consultations Log</h2>
        <p className='text-xs text-gray-400 mt-0.5'>Review appointments, confirm completions, or manage cancellations.</p>
      </div>

      {/* Control Bar (Search & Filter) */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-sm'>
        
        {/* Search */}
        <div className='relative flex-1 max-w-md'>
          <input 
            type="text" 
            placeholder="Search patient by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors'
          />
          <span className='absolute left-3.5 top-3 text-gray-400 text-sm'>🔍</span>
        </div>

        {/* Filter Buttons Wrapper */}
        <div className='flex flex-wrap gap-3 items-center'>
          
          {/* Status Filter */}
          <div className='flex gap-1 border-r border-gray-200 pr-3 mr-1'>
            {['All', 'Pending', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Payment Filter */}
          <div className='flex gap-1'>
            {['All', 'Online', 'Cash'].map((pay) => (
              <button
                key={pay}
                onClick={() => setPaymentFilter(pay)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  paymentFilter === pay 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {pay}
              </button>
            ))}
          </div>

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
                <th className='py-4 px-6'>Scheduled Date & Time</th>
                <th className='py-4 px-6 text-center'>Method</th>
                <th className='py-4 px-6 text-right'>FEE</th>
                <th className='py-4 px-6 text-center'>Status</th>
                <th className='py-4 px-6 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50 text-sm text-gray-600'>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className='py-16 text-center space-y-2'>
                    <div className='text-3xl'>🗂️</div>
                    <p className='text-gray-400 font-medium'>No consultations match your filter criteria.</p>
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
                      <td className='py-4 px-6 text-center'>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                          item.payment 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {item.payment ? 'Online' : 'Cash'}
                        </span>
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
                          <div className='inline-flex items-center gap-1.5'>
                            <button 
                              onClick={() => cancelAppointment(item._id)} 
                              className='p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-100 transition-all shadow-sm'
                              title="Cancel Consultation"
                            >
                              <img className='w-4 h-4 object-contain invert-[0.3] hover:invert-0' src={assets.cancel_icon} alt="" />
                            </button>
                            <button 
                              onClick={() => completeAppointment(item._id)} 
                              className='p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 transition-all shadow-sm'
                              title="Mark Completed"
                            >
                              <img className='w-4 h-4 object-contain' src={assets.tick_icon} alt="" />
                            </button>
                          </div>
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
            <p>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} logs</p>
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

export default DoctorAppointments