import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    navigate('/login')
  }

  return (
    <div className='sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100/80 px-4 sm:px-10 flex items-center justify-between py-3 transition-all duration-300'>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold text-xl">
          A
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Appointy</span>
      </div>

      <ul className='hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600'>
        <li className='relative py-1.5'>
          <NavLink to='/' className={({ isActive }) => `hover:text-indigo-600 transition-colors relative ${isActive ? 'text-indigo-600 font-bold' : ''}`}>
            {({ isActive }) => (
              <>
                HOME
                {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full animate-fade-in"></span>}
              </>
            )}
          </NavLink>
        </li>
        <li className='relative py-1.5'>
          <NavLink to='/doctors' className={({ isActive }) => `hover:text-indigo-600 transition-colors relative ${isActive ? 'text-indigo-600 font-bold' : ''}`}>
            {({ isActive }) => (
              <>
                ALL DOCTORS
                {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full animate-fade-in"></span>}
              </>
            )}
          </NavLink>
        </li>
        <li className='relative py-1.5'>
          <NavLink to='/about' className={({ isActive }) => `hover:text-indigo-600 transition-colors relative ${isActive ? 'text-indigo-600 font-bold' : ''}`}>
            {({ isActive }) => (
              <>
                ABOUT
                {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full animate-fade-in"></span>}
              </>
            )}
          </NavLink>
        </li>
        <li className='relative py-1.5'>
          <NavLink to='/contact' className={({ isActive }) => `hover:text-indigo-600 transition-colors relative ${isActive ? 'text-indigo-600 font-bold' : ''}`}>
            {({ isActive }) => (
              <>
                CONTACT
                {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full animate-fade-in"></span>}
              </>
            )}
          </NavLink>
        </li>
      </ul>

      <div className='flex items-center gap-3.5'>
        {/* Admin Panel Button */}
        {location.pathname === '/' && (
          <button
            onClick={() => window.open('https://appointy-six.vercel.app', '_blank')}
            className='bg-gray-55 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4.5 py-2 rounded-xl transition-all border border-gray-200 hidden md:block'
          >
            Admin Panel
          </button>
        )}

        {token && userData ? (
          <div className='flex items-center gap-1.5 cursor-pointer group relative py-1.5'>
            <img className='w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm bg-gray-100' src={userData.image || '/fallback-user.png'} alt="profile" />
            <img className='w-2 h-2 opacity-50 group-hover:rotate-180 transition-transform duration-300' src={assets.dropdown_icon || '/fallback-icon.png'} alt="dropdown" />
            
            <div className='absolute top-full right-0 pt-2 z-50 hidden group-hover:block animate-fade-in'>
              <div className='min-w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-2.5 flex flex-col gap-1 text-sm font-medium text-gray-600'>
                <p onClick={() => navigate('my-profile')} className='hover:bg-indigo-50 hover:text-indigo-600 rounded-lg px-3 py-2 transition-colors cursor-pointer'>My Profile</p>
                <p onClick={() => navigate('my-appointments')} className='hover:bg-indigo-50 hover:text-indigo-600 rounded-lg px-3 py-2 transition-colors cursor-pointer'>My Appointments</p>
                <hr className="border-gray-50 my-1" />
                <p onClick={logout} className='hover:bg-rose-50 hover:text-rose-600 rounded-lg px-3 py-2 transition-colors cursor-pointer text-rose-500'>Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:translate-y-[-1px] transition-all hidden md:block'
          >
            Create Account
          </button>
        )}

        {/* Mobile Hamburger menu */}
        <button 
          onClick={() => setShowMenu(true)} 
          className='p-2 hover:bg-gray-50 rounded-lg md:hidden border border-gray-100 shadow-sm transition-colors'
          aria-label="Open main navigation menu"
        >
          <img className='w-5 h-5 object-contain' src={assets.menu_icon} alt="" />
        </button>

        {/* ---- Mobile Menu Overlay ---- */}
        <div className={`md:hidden fixed inset-0 z-50 overflow-hidden bg-white/95 backdrop-blur-lg transition-all duration-300 ${showMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-50'>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Appointy</span>
            </div>
            <button 
              onClick={() => setShowMenu(false)} 
              className='p-2 hover:bg-gray-50 rounded-lg border border-gray-100 shadow-sm'
              aria-label="Close main navigation menu"
            >
              <img src={assets.cross_icon} className='w-5 h-5 object-contain' alt="" />
            </button>
          </div>
          <ul className='flex flex-col items-stretch gap-2 mt-6 px-6 text-base font-semibold text-gray-700'>
            <li>
              <NavLink onClick={() => setShowMenu(false)} to='/' className={({ isActive }) => `block px-4 py-2.5 rounded-xl ${isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}>HOME</NavLink>
            </li>
            <li>
              <NavLink onClick={() => setShowMenu(false)} to='/doctors' className={({ isActive }) => `block px-4 py-2.5 rounded-xl ${isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}>ALL DOCTORS</NavLink>
            </li>
            <li>
              <NavLink onClick={() => setShowMenu(false)} to='/about' className={({ isActive }) => `block px-4 py-2.5 rounded-xl ${isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}>ABOUT</NavLink>
            </li>
            <li>
              <NavLink onClick={() => setShowMenu(false)} to='/contact' className={({ isActive }) => `block px-4 py-2.5 rounded-xl ${isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}>CONTACT</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar

