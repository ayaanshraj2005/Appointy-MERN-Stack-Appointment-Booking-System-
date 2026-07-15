import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className='flex flex-col md:flex-row flex-wrap bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl px-6 md:px-10 lg:px-20 shadow-xl shadow-indigo-500/10 overflow-hidden relative group my-6'>
            {/* Ambient Background Circles */}
            <div className='absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700'></div>
            <div className='absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-115 transition-transform duration-700'></div>

            {/* --------- Header Left --------- */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-5 py-12 m-auto md:py-[8vw] md:mb-[-10px] z-10 animate-fade-in'>
                <p className='text-3xl md:text-4xl lg:text-5xl text-white font-extrabold leading-tight md:leading-tight lg:leading-tight tracking-tight'>
                    Book Appointment <br /> With <span className="underline decoration-indigo-300 decoration-wavy underline-offset-4">Trusted Doctors</span>
                </p>
                <div className='flex flex-col sm:flex-row items-center gap-3 text-indigo-100 text-sm font-medium'>
                    <img className='w-24 h-auto shadow-sm object-contain' src={assets.group_profiles} alt="" />
                    <p className='text-center sm:text-left leading-relaxed'>Simply browse through our extensive list of trusted doctors, <br className='hidden sm:block' /> schedule your appointment hassle-free.</p>
                </div>
                <a href='#speciality' className='flex items-center gap-2.5 bg-white text-indigo-600 hover:text-indigo-700 px-8 py-3.5 rounded-xl font-bold text-sm m-auto md:m-0 shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0 transition-all duration-300'>
                    Book appointment <img className='w-3 h-3 object-contain transition-transform group-hover:translate-x-1' src={assets.arrow_icon} alt="" />
                </a>
            </div>

            {/* --------- Header Right --------- */}
            <div className='md:w-1/2 relative flex items-end justify-center z-10'>
                <img className='w-full max-w-md md:absolute bottom-0 h-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02]' src={assets.header_img} alt="" />
            </div>
        </div>
    )
}

export default Header