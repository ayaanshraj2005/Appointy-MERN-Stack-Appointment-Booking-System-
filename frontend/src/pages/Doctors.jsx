import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  // Skeleton Loaders
  const Skeletons = () => (
    <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
      {[...Array(6)].map((_, i) => (
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

  const specialtiesList = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ]

  return (
    <div className='m-4 sm:m-6 space-y-6 text-[#2C3E50]'>
      <div>
        <h2 className='text-2xl font-extrabold text-gray-800 tracking-tight'>Browse Specialists</h2>
        <p className='text-xs text-gray-400 font-medium mt-0.5'>Select your required field and schedule consultation slots.</p>
      </div>

      <div className='flex flex-col sm:flex-row items-start gap-6'>
        
        {/* Toggle Mobile Filter Button */}
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className={`w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 shadow-sm transition-all sm:hidden active:bg-gray-50 flex items-center justify-between ${showFilter ? 'border-indigo-500 text-indigo-600' : ''}`}
          aria-label="Toggle specialties filter options"
        >
          <span>🏷️ Filter Speciality</span>
          <span>{showFilter ? '▲' : '▼'}</span>
        </button>

        {/* Sidebar Filters */}
        <div className={`w-full sm:w-64 flex-shrink-0 flex-col gap-2.5 text-sm ${showFilter ? 'flex animate-fade-in' : 'hidden sm:flex'}`}>
          {specialtiesList.map((spec) => {
            const isSelected = speciality === spec
            return (
              <p 
                key={spec}
                onClick={() => isSelected ? navigate('/doctors') : navigate(`/doctors/${spec}`)} 
                className={`pl-4 py-3 pr-6 border rounded-2xl font-bold cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {spec}
              </p>
            )
          })}
        </div>

        {/* Doctor Cards Grid */}
        <div className='flex-1 w-full'>
          {doctors.length === 0 ? (
            <Skeletons />
          ) : filterDoc.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl space-y-3.5 text-center'>
              <div className='text-4xl'>🩺</div>
              <p className='text-gray-400 font-bold text-base'>No doctors available in this speciality right now.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
              {filterDoc.map((item, index) => (
                <div 
                  onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} 
                  className='bg-white border border-gray-100 hover:border-indigo-150 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:translate-y-[-8px] transition-all duration-300 group' 
                  key={index}
                >
                  <div className='relative overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50/40 h-48 flex items-center justify-center'>
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
        </div>

      </div>
    </div>
  )
}

export default Doctors
