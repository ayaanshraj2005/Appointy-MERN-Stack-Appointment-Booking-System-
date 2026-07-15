import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [payment, setPayment] = useState('')

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month)]} ${year}`
  }

  // Getting User Appointments Data Using API
  const getUserAppointments = async () => {
    try {

      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { Authorization: `Bearer ${token}` } })
      setAppointments(data.appointments.reverse())

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {

    try {

      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {

        console.log(response)

        try {
          const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { Authorization: `Bearer ${token}` } });
          if (data.success) {
            navigate('/my-appointments')
            getUserAppointments()
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  // Function to make payment using razorpay
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // Generate appointment data from doctors
  useEffect(() => {
    if (doctors.length) {
      const generatedAppointments = doctors.slice(0, 3).map((doc, idx) => ({
        _id: `appointment_${idx}`,
        docData: {
          name: doc.name,
          speciality: doc.speciality,
          image: doc.image,
          address: doc.address || { line1: "Street X", line2: "City Y" }
        },
        slotDate: `12_0${idx + 1}_2025`,
        slotTime: `${10 + idx}:00 AM`,
        payment: idx === 1,         // Simulate second one as paid
        isCompleted: idx === 2,     // Simulate third one as completed
        cancelled: false
      }))
      setAppointments(generatedAppointments)
    }
  }, [doctors])



  const simulateStripe = () => toast.info("Redirecting to Stripe...")
  const simulateRazorpay = () => toast.info("Opening Razorpay...")

  return (
    <div className='m-4 sm:m-6 space-y-6 text-[#2C3E50]'>
      <div>
        <h2 className='text-2xl font-extrabold text-gray-800 tracking-tight'>My Appointments</h2>
        <p className='text-xs text-gray-400 font-medium mt-0.5'>Track scheduled consultations, complete payments, or cancel visits.</p>
      </div>

      <div className='space-y-4'>
        {appointments.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl space-y-3.5 text-center'>
            <div className='text-4xl'>📅</div>
            <p className='text-gray-400 font-bold text-base'>No appointments scheduled yet.</p>
          </div>
        ) : (
          appointments.map((item, index) => (
            <div 
              key={index} 
              className='bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between'
            >
              
              {/* Doctor Details & Date */}
              <div className='flex flex-col xs:flex-row gap-4 items-start sm:items-center'>
                <div className='w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50/40 flex items-center justify-center flex-shrink-0 border border-gray-50 shadow-inner'>
                  <img className='w-full h-full object-cover object-top' src={item.docData.image} alt="" />
                </div>
                
                <div className='space-y-1.5 text-xs text-gray-450 font-semibold'>
                  <h4 className='text-gray-800 text-base font-extrabold leading-tight'>{item.docData.name}</h4>
                  <p className='text-indigo-600 text-xs font-bold'>{item.docData.speciality}</p>
                  
                  <div className='text-[10px] text-gray-400 leading-relaxed space-y-0.5 mt-1 font-medium'>
                    <p>📍 {item.docData.address.line1}</p>
                    <p className='pl-3.5'>{item.docData.address.line2}</p>
                  </div>

                  <p className='text-gray-700 text-xs mt-2 font-bold'>
                    📅 Schedule: <span className='text-indigo-600'>{slotDateFormat(item.slotDate)}</span> at <span className='text-indigo-600'>{item.slotTime}</span>
                  </p>
                </div>
              </div>

              {/* Action Operations */}
              <div className='w-full sm:w-auto flex flex-row sm:flex-col gap-2 justify-end items-center sm:items-stretch self-stretch sm:self-center border-t border-gray-50 pt-4 sm:pt-0 sm:border-none'>
                
                {/* Pay Online Flow */}
                {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                  <button 
                    onClick={() => setPayment(item._id)} 
                    className='flex-1 sm:flex-none text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-600/5 duration-300'
                  >
                    Pay Online
                  </button>
                )}

                {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                  <button 
                    onClick={() => appointmentRazorpay(item._id)} 
                    className='flex-1 sm:flex-none bg-white hover:bg-slate-50 border border-gray-200 py-2 px-6 rounded-xl flex items-center justify-center transition-all'
                  >
                    <img className='max-h-4 object-contain' src={assets.razorpay_logo} alt="Razorpay" />
                  </button>
                )}

                {!item.cancelled && item.payment && !item.isCompleted && (
                  <span className='px-4 py-2 text-center bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold text-xs'>
                    Paid Online
                  </span>
                )}

                {/* Completion Status */}
                {item.isCompleted && (
                  <span className='px-4 py-2 text-center bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold text-xs'>
                    Completed
                  </span>
                )}

                {/* Cancel Actions */}
                {!item.cancelled && !item.isCompleted && (
                  <button 
                    onClick={() => cancelAppointment(item._id)} 
                    className='flex-1 sm:flex-none text-center text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-rose-200 font-bold text-xs px-6 py-2.5 rounded-xl transition-all duration-300 shadow-sm'
                  >
                    Cancel Booking
                  </button>
                )}

                {item.cancelled && !item.isCompleted && (
                  <span className='px-4 py-2 text-center bg-rose-50 text-rose-500 border border-rose-100 rounded-xl font-bold text-xs w-full'>
                    Cancelled
                  </span>
                )}

              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyAppointments
