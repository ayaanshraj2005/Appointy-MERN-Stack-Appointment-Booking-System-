import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { assets } from './assets/assets'
import RelatedDoctors from './components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const doc = doctors.find((doc) => doc._id === docId)
    if (doc) {
      // Ensure slots_booked is always at least an empty object
      setDocInfo({ ...doc, slots_booked: doc.slots_booked || {} })
    }
  }

  const getAvailableSlots = () => {
    if (!docInfo) return
    setDocSlots([])

    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      const endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      const timeSlots = []

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })

        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const slotDate = `${day}_${month}_${year}`
        const slotTime = formattedTime

        const isSlotAvailable =
          !docInfo?.slots_booked?.[slotDate] ||
          !docInfo.slots_booked[slotDate].includes(slotTime)

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots((prev) => [...prev, timeSlots])
    }
  }

  const bookAppointment = async () => {

    if (!token) {
      toast.warning('Login to book appointment')
      return navigate('/login')
    }

    const date = docSlots[slotIndex][0].datetime
  
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    const slotDate = day + "_" + month + "_" + year

    try {

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])

  return (
    docInfo && (
      <div className='m-4 sm:m-6 space-y-8 text-[#2C3E50]'>
        
        {/* Doctor Details Showcase */}
        <div className='flex flex-col md:flex-row gap-6 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden'>
          <div className='w-full md:max-w-64 flex-shrink-0 relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/40 h-64 flex items-center justify-center border border-gray-50'>
            <img className='w-full h-full object-cover object-top' src={docInfo.image} alt="" />
          </div>
          
          <div className='flex-1 space-y-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2'>
                {docInfo.name} 
                <img className='w-5 h-5 object-contain' src={assets.verified_icon} alt="" />
              </h1>
            </div>

            <div className='flex flex-wrap items-center gap-2.5 text-sm text-gray-500 font-semibold'>
              <p>{docInfo.degree} — {docInfo.speciality}</p>
              <span className='px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg'>
                {docInfo.experience} Experience
              </span>
            </div>

            <hr className="border-gray-50" />

            <div className='space-y-1.5'>
              <h4 className='font-bold text-gray-800 text-sm flex items-center gap-1.5'>
                About Professional
                <img className='w-3.5 h-3.5 opacity-60' src={assets.info_icon} alt="" />
              </h4>
              <p className='text-sm text-gray-400 font-medium leading-relaxed max-w-[700px]'>{docInfo.about}</p>
            </div>

            <div className='pt-2'>
              <p className='text-sm font-semibold text-gray-400'>
                Consultation Fee: <span className='text-lg font-black text-gray-800 ml-1'>{currencySymbol} {docInfo.fees}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Booking Slot Selection */}
        <div className='bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6'>
          <div>
            <h3 className='text-lg font-bold text-gray-800'>Select Consultation Slot</h3>
            <p className='text-xs text-gray-400 mt-0.5 font-medium'>Choose a scheduled date and time to book your visit.</p>
          </div>

          {/* Days Calendar Scroll */}
          <div className='space-y-3.5'>
            <h5 className='text-xs font-bold uppercase tracking-wider text-gray-400'>Available Dates</h5>
            <div className='flex gap-3 items-center w-full overflow-x-auto pb-2 scrollbar-none'>
              {docSlots.length > 0 &&
                docSlots.map((item, index) => (
                  <div
                    onClick={() => setSlotIndex(index)}
                    key={index}
                    className={`text-center py-4 px-3 min-w-16 rounded-2xl cursor-pointer transition-all border ${
                      slotIndex === index 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <p className='text-[10px] font-bold uppercase tracking-wider opacity-85'>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                    <p className='text-base font-extrabold mt-0.5'>{item[0] && item[0].datetime.getDate()}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Time Slots Selector */}
          {docSlots.length > 0 && docSlots[slotIndex] && (
            <div className='space-y-3.5'>
              <h5 className='text-xs font-bold uppercase tracking-wider text-gray-400'>Available Hours</h5>
              <div className='flex items-center gap-2.5 w-full overflow-x-auto pb-2 scrollbar-none'>
                {docSlots[slotIndex].map((item, index) => (
                  <p
                    onClick={() => setSlotTime(item.time)}
                    key={index}
                    className={`text-xs font-bold flex-shrink-0 px-4.5 py-2.5 rounded-xl cursor-pointer transition-all border ${
                      item.time === slotTime
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/10'
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {item.time.toLowerCase()}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Confirm booking Button */}
          <div className='pt-2 border-t border-gray-50 flex justify-end'>
            <button
              onClick={bookAppointment}
              className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98]'
            >
              Book an Appointment
            </button>
          </div>
        </div>

        {/* Related Specialists */}
        <div className='mt-4'>
          <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
      </div>
    )
  )
}

export default Appointment
