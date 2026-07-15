import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
    return (
        <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-[#2C3E50]'>
            <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>Find by Speciality</h1>
            <p className='sm:w-1/3 text-center text-sm text-gray-400 font-medium leading-relaxed'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
            
            <div className='flex sm:justify-center gap-5 pt-6 w-full overflow-x-auto pb-4 scrollbar-none'>
                {specialityData.map((item, index) => (
                    <Link 
                        to={`/doctors/${item.speciality}`} 
                        onClick={() => scrollTo(0, 0)} 
                        className='flex flex-col items-center text-xs font-bold text-gray-600 bg-white border border-gray-100 hover:border-indigo-150 p-4 w-28 sm:w-32 rounded-2xl cursor-pointer flex-shrink-0 hover:shadow-md hover:translate-y-[-6px] hover:text-indigo-600 transition-all duration-300' 
                        key={index}
                    >
                        <img className='w-12 sm:w-16 h-auto mb-3 object-contain bg-indigo-50/50 p-2 rounded-xl' src={item.image} alt="" />
                        <p className="text-center tracking-wide">{item.speciality}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SpecialityMenu