import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  // Skeleton Loaders
  const Skeletons = () => (
    <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 pt-5 px-3 sm:px-0'>
      {[...Array(10)].map((_, i) => (
        <div key={i} className='bg-white border border-gray-100 rounded-3xl overflow-hidden animate-pulse shadow-sm'>
          <div className='bg-gray-200 h-44 w-full'></div>
          <div className='p-5 space-y-3.5'>
            <div className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-full bg-gray-200'></div>
              <div className='w-16 h-3.5 bg-gray-200 rounded'></div>
            </div>
            <div className='w-24 h-4.5 bg-gray-200 rounded'></div>
            <div className='w-16 h-3 bg-gray-200 rounded'></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-[#2C3E50] md:mx-10'>
      <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm text-gray-400 font-medium leading-relaxed'>Simply browse through our extensive list of trusted doctors.</p>
      
      {doctors.length === 0 ? (
        <Skeletons />
      ) : (
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 pt-6 px-3 sm:px-0'>
          {doctors.slice(0, 10).map((item, index) => (
            <div 
              onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} 
              className='bg-white border border-gray-100 hover:border-indigo-150 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:translate-y-[-8px] transition-all duration-300 group' 
              key={index}
            >
              <div className='relative overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50/40 h-44 flex items-center justify-center'>
                <img className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105' src={item.image} alt="" />
              </div>
              <div className='p-5 space-y-1.5'>
                <div className='flex items-center gap-2'>
                  <span className={`relative flex h-2.5 w-2.5`}>
                    {item.available && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${item.available ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                  </span>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${item.available ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </p>
                </div>
                <h4 className='text-gray-800 text-base font-bold leading-tight group-hover:text-indigo-600 transition-colors'>{item.name}</h4>
                <p className='text-gray-400 text-xs font-semibold'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} 
        className='mt-10 px-8 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/5 duration-300'
      >
        View All Doctors
      </button>
    </div>
  )
}

export default TopDoctors

