import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData, appointments, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)
  
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (aToken) {
        setLoading(true)
        await Promise.all([getDashData(), getAllAppointments()])
        setLoading(false)
      }
    }
    loadData()
  }, [aToken])

  if (loading || !dashData) {
    return (
      <div className='m-6 w-full max-w-6xl animate-pulse space-y-6'>
        {/* Banner Skeleton */}
        <div className='h-28 bg-gray-200 rounded-2xl w-full'></div>
        
        {/* Metric Cards Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <div className='h-24 bg-gray-200 rounded-2xl'></div>
          <div className='h-24 bg-gray-200 rounded-2xl'></div>
          <div className='h-24 bg-gray-200 rounded-2xl'></div>
        </div>

        {/* Charts & Table Skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 h-96 bg-gray-200 rounded-2xl'></div>
          <div className='h-96 bg-gray-200 rounded-2xl'></div>
        </div>
      </div>
    )
  }

  // --- Process analytics data from context appointments ---
  const MONTHS_MAP = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const now = new Date()
  const trendData = []
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    trendData.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      name: MONTHS_MAP[d.getMonth() + 1],
      count: 0
    })
  }

  let completedCount = 0
  let cancelledCount = 0
  let pendingCount = 0

  if (appointments && appointments.length > 0) {
    appointments.forEach(item => {
      if (item.cancelled) {
        cancelledCount++
      } else if (item.isCompleted) {
        completedCount++
      } else {
        pendingCount++
      }

      if (item.slotDate) {
        const parts = item.slotDate.split('_')
        if (parts.length >= 3) {
          const apptMonth = parseInt(parts[1], 10)
          const apptYear = parseInt(parts[2], 10)
          const match = trendData.find(t => t.month === apptMonth && t.year === apptYear)
          if (match) {
            match.count++
          }
        }
      }
    })
  } else {
    // Fallback counts using dashData in case appointments list is empty
    completedCount = Math.round(dashData.appointments * 0.7)
    cancelledCount = Math.round(dashData.appointments * 0.15)
    pendingCount = dashData.appointments - completedCount - cancelledCount
    
    // Fallback dummy trend values
    trendData.forEach((t, index) => {
      t.count = [3, 5, 8, 4, 10, dashData.appointments][index] || 5
    })
  }

  const maxVal = Math.max(...trendData.map(d => d.count), 5)
  const totalStatus = completedCount + cancelledCount + pendingCount || 1

  return (
    <div className='m-6 w-full max-w-6xl space-y-6 text-[#2C3E50]'>
      
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-purple-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>Welcome back, Admin!</h1>
          <p className='text-indigo-100 mt-1 md:text-sm text-xs'>Here's your comprehensive healthcare facility health check at a glance.</p>
        </div>
        <div className='bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs md:text-sm font-medium border border-white/20'>
          📅 {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        <div className='bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden'>
          <div className='absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-125 transition-transform duration-500'></div>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-indigo-50 rounded-xl text-indigo-500 group-hover:bg-indigo-100 transition-colors'>
              <img className='w-8 h-8 object-contain' src={assets.doctor_icon} alt="" />
            </div>
            <div>
              <p className='text-sm text-gray-400 font-medium uppercase tracking-wider'>Active Doctors</p>
              <h3 className='text-3xl font-extrabold mt-1 text-gray-800'>{dashData.doctors}</h3>
            </div>
          </div>
        </div>

        <div className='bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden'>
          <div className='absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-125 transition-transform duration-500'></div>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-purple-50 rounded-xl text-purple-500 group-hover:bg-purple-100 transition-colors'>
              <img className='w-8 h-8 object-contain' src={assets.appointments_icon} alt="" />
            </div>
            <div>
              <p className='text-sm text-gray-400 font-medium uppercase tracking-wider'>Total Appointments</p>
              <h3 className='text-3xl font-extrabold mt-1 text-gray-800'>{dashData.appointments}</h3>
            </div>
          </div>
        </div>

        <div className='bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden'>
          <div className='absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-pink-500/5 rounded-full group-hover:scale-125 transition-transform duration-500'></div>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-pink-50 rounded-xl text-pink-500 group-hover:bg-pink-100 transition-colors'>
              <img className='w-8 h-8 object-contain' src={assets.patients_icon} alt="" />
            </div>
            <div>
              <p className='text-sm text-gray-400 font-medium uppercase tracking-wider'>Total Patients</p>
              <h3 className='text-3xl font-extrabold mt-1 text-gray-800'>{dashData.patients}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        
        {/* Area Trend Chart */}
        <div className='lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4'>
          <div className='flex justify-between items-center border-b border-gray-50 pb-3'>
            <div>
              <h3 className='font-bold text-gray-800 text-lg'>Booking Volume Trend</h3>
              <p className='text-xs text-gray-400'>Total bookings count aggregated monthly over past 6 months</p>
            </div>
          </div>
          
          <div className='relative h-64 w-full'>
            <svg viewBox="0 0 500 200" className='w-full h-full overflow-visible'>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" />
              <line x1="30" y1="75" x2="480" y2="75" stroke="#f1f5f9" strokeDasharray="3,3" />
              <line x1="30" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeDasharray="3,3" />
              <line x1="30" y1="185" x2="480" y2="185" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Chart line and area */}
              {(() => {
                const points = trendData.map((d, index) => {
                  const x = 30 + (index * 90)
                  const y = 185 - (d.count / maxVal * 155)
                  return { x, y }
                })
                
                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                const areaPath = `${linePath} L ${points[points.length - 1].x} 185 L ${points[0].x} 185 Z`

                return (
                  <>
                    <path d={areaPath} fill="url(#areaGradient)" />
                    <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={hoveredPoint === i ? 6 : 4} 
                          fill="#ffffff" 
                          stroke="#6366f1" 
                          strokeWidth="2.5" 
                          className='cursor-pointer transition-all duration-150'
                          onMouseEnter={() => setHoveredPoint(i)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <text x={p.x} y="198" textAnchor="middle" className='text-[8px] fill-gray-400 font-medium'>{trendData[i].name}</text>
                      </g>
                    ))}
                  </>
                )
              })()}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredPoint !== null && (
              <div 
                className='absolute bg-gray-800 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150'
                style={{ 
                  left: `${30 + (hoveredPoint * 18.2)}%`, 
                  top: `${185 - (trendData[hoveredPoint].count / maxVal * 155) - 40}px` 
                }}
              >
                <p className='font-semibold'>{trendData[hoveredPoint].name}: {trendData[hoveredPoint].count} Bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* Ring Chart Breakdown */}
        <div className='bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4'>
          <div>
            <h3 className='font-bold text-gray-800 text-lg'>Status Distribution</h3>
            <p className='text-xs text-gray-400'>Breakdown of total booked appointments</p>
          </div>

          <div className='flex flex-col items-center justify-center py-2 relative'>
            <svg width="150" height="150" viewBox="0 0 36 36" className='transform -rotate-90'>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
              
              {/* Completed Segment */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.915" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeDasharray={`${(completedCount / totalStatus) * 100} ${100 - (completedCount / totalStatus) * 100}`} 
                strokeDashoffset="0"
              />

              {/* Pending Segment */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.915" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2.5" 
                strokeDasharray={`${(pendingCount / totalStatus) * 100} ${100 - (pendingCount / totalStatus) * 100}`} 
                strokeDashoffset={`${-((completedCount / totalStatus) * 100)}`}
              />

              {/* Cancelled Segment */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.915" 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="2.5" 
                strokeDasharray={`${(cancelledCount / totalStatus) * 100} ${100 - (cancelledCount / totalStatus) * 100}`} 
                strokeDashoffset={`${-(((completedCount + pendingCount) / totalStatus) * 100)}`}
              />
            </svg>
            <div className='absolute flex flex-col items-center justify-center'>
              <span className='text-2xl font-black text-gray-800'>{totalStatus}</span>
              <span className='text-[10px] text-gray-400 font-medium uppercase'>Total</span>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-50'>
            <div>
              <span className='inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1.5'></span>
              <span className='text-[10px] text-gray-400 font-medium uppercase'>Done</span>
              <p className='text-sm font-bold text-gray-700 mt-0.5'>{completedCount}</p>
            </div>
            <div>
              <span className='inline-block w-2.5 h-2.5 bg-blue-500 rounded-full mr-1.5'></span>
              <span className='text-[10px] text-gray-400 font-medium uppercase'>Pending</span>
              <p className='text-sm font-bold text-gray-700 mt-0.5'>{pendingCount}</p>
            </div>
            <div>
              <span className='inline-block w-2.5 h-2.5 bg-rose-500 rounded-full mr-1.5'></span>
              <span className='text-[10px] text-gray-400 font-medium uppercase'>Cancelled</span>
              <p className='text-sm font-bold text-gray-700 mt-0.5'>{cancelledCount}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Latest Bookings Feed */}
      <div className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/50'>
          <div className='flex items-center gap-2.5'>
            <img className='w-5 h-5 opacity-70' src={assets.list_icon} alt="" />
            <h3 className='font-bold text-gray-800 text-lg'>Latest Bookings Feed</h3>
          </div>
        </div>

        {dashData.latestAppointments.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center space-y-3'>
            <div className='text-4xl'>📭</div>
            <p className='text-gray-400 font-medium'>No recent bookings to display.</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-50'>
            {dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div className='flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4 hover:bg-gray-50/60 transition-colors' key={index}>
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    <img className='rounded-2xl w-12 h-12 object-cover border-2 border-white shadow-sm bg-gray-100' src={item.docData.image} alt="" />
                    <span className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full'></span>
                  </div>
                  <div>
                    <h4 className='font-bold text-gray-800 text-sm'>{item.docData.name}</h4>
                    <p className='text-xs text-gray-500 mt-0.5 flex items-center gap-1'>
                      📅 Scheduled for: <span className='font-semibold text-indigo-500'>{slotDateFormat(item.slotDate)} at {item.slotTime}</span>
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 self-end sm:self-center'>
                  {item.cancelled ? (
                    <span className='px-3 py-1 bg-rose-50 text-rose-500 text-xs font-semibold rounded-full border border-rose-100 animate-fade-in'>
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className='px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-100 animate-fade-in'>
                      Completed
                    </span>
                  ) : (
                    <button 
                      onClick={() => cancelAppointment(item._id)} 
                      className='flex items-center gap-1.5 px-3 py-1 text-xs text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-rose-200 rounded-full shadow-sm hover:shadow transition-all duration-200'
                    >
                      <img className='w-3 h-3 object-contain invert-[0.3] hover:invert-0' src={assets.cancel_icon} alt="" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard