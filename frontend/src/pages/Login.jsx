import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try{
    if (state === 'Sign Up') {

      const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })

      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        toast.error(data.message)
      }

    } else {

      const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        toast.error(data.message)
      }

    }}catch(error){
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[75vh] flex items-center justify-center py-8 text-[#2C3E50]'>
      <div className='bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-lg shadow-indigo-500/5 space-y-5'>
        
        <div className='space-y-1.5 text-center sm:text-left'>
          <h2 className='text-2xl font-extrabold text-gray-800 tracking-tight'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className='text-xs text-gray-400 font-medium'>
            Please {state === 'Sign Up' ? 'sign up' : 'log in'} to schedule your consultation slots.
          </p>
        </div>

        <div className='space-y-4'>
          {state === 'Sign Up' && (
            <div className='space-y-1'>
              <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Full Name</label>
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors' 
                type="text" 
                placeholder="John Doe"
                required 
              />
            </div>
          )}
          
          <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Email Address</label>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors' 
              type="email" 
              placeholder="example@mail.com"
              required 
            />
          </div>

          <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Password</label>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors' 
              type="password" 
              placeholder="••••••••"
              required 
            />
          </div>
        </div>

        <button 
          type='submit' 
          className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98]'
        >
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        <div className='text-center pt-2 text-xs font-semibold text-gray-500'>
          {state === 'Sign Up' ? (
            <p>
              Already have an account?{' '}
              <span 
                onClick={() => { setState('Login'); setName(''); }} 
                className='text-indigo-600 hover:text-indigo-700 underline cursor-pointer font-bold ml-0.5'
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              New to Appointy?{' '}
              <span 
                onClick={() => { setState('Sign Up'); }} 
                className='text-indigo-600 hover:text-indigo-700 underline cursor-pointer font-bold ml-0.5'
              >
                Create an account
              </span>
            </p>
          )}
        </div>

      </div>
    </form>
  )
}

export default Login