import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    const navigate = useNavigate()

    return (
        <div className='flex bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl px-6 sm:px-10 md:px-14 lg:px-16 my-20 md:mx-10 shadow-xl shadow-indigo-500/10 overflow-hidden relative group'>
            {/* Ambient Background Circles */}
            <div className='absolute -right-10 -top-10 w-44 h-44 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700'></div>
            <div className='absolute -left-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700'></div>

            {/* ------- Left Side ------- */}
            <div className='flex-1 py-10 sm:py-12 md:py-16 lg:py-24 z-10'>
                <div className='text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight'>
                    <p>Book Appointment</p>
                    <p className='mt-2 text-indigo-100 font-medium text-lg sm:text-xl lg:text-3xl'>With 100+ Trusted Doctors</p>
                </div>
                <button 
                    onClick={() => { navigate('/login'); scrollTo(0, 0) }} 
                    className='bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-750 text-xs sm:text-sm font-bold px-8 py-3.5 rounded-xl mt-6 shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0 transition-all duration-300'
                >
                    Create Account
                </button>
            </div>

            {/* ------- Right Side ------- */}
            <div className='hidden md:block md:w-1/2 lg:w-[320px] relative z-10 flex items-end justify-center'>
                <img className='w-full absolute bottom-0 right-0 max-w-sm drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02]' src={assets.appointment_img} alt="" />
            </div>
        </div>
    )
}

export default Banner