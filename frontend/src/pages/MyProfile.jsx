import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData()
            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)
            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return userData ? (
        <div className='max-w-xl bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-[#2C3E50] my-6'>
            
            {/* Header / Avatar Edit */}
            <div className='flex flex-col items-center gap-4 text-center pb-4 border-b border-gray-50'>
                {isEdit ? (
                    <label htmlFor='image' className='group relative cursor-pointer block w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-50 shadow-md bg-gray-100 hover:border-indigo-200 transition-all'>
                        <img className='w-full h-full object-cover group-hover:opacity-75 transition-opacity' src={image ? URL.createObjectURL(image) : userData.image} alt="avatar" />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
                        </div>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                    </label>
                ) : (
                    <div className='w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-50 shadow-md bg-gray-100'>
                        <img className='w-full h-full object-cover' src={userData.image} alt="avatar" />
                    </div>
                )}

                <div className='space-y-1 w-full max-w-xs'>
                    {isEdit ? (
                        <input 
                            className='w-full text-center border border-gray-200 rounded-xl px-3 py-1.5 text-lg font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-indigo-500' 
                            type="text"
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                            value={userData.name}
                        />
                    ) : (
                        <h3 className='font-extrabold text-2xl text-gray-800 tracking-tight'>{userData.name}</h3>
                    )}
                    <p className='text-xs text-gray-400 font-semibold uppercase tracking-wider'>Patient Profile</p>
                </div>
            </div>

            {/* Contact Information */}
            <div className='space-y-4'>
                <h4 className='font-bold text-gray-800 text-sm uppercase tracking-wider border-l-4 border-indigo-500 pl-2.5'>Contact Information</h4>
                <div className='grid grid-cols-1 sm:grid-cols-[1fr_2.5fr] gap-4 text-sm font-medium text-gray-500'>
                    <p className='pt-1.5'>Email Address</p>
                    <p className='text-indigo-600 font-semibold pt-1.5'>{userData.email}</p>

                    <p className='pt-1.5'>Phone Number</p>
                    {isEdit ? (
                        <input 
                            className='w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors' 
                            type="text"
                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                            value={userData.phone}
                        />
                    ) : (
                        <p className='text-indigo-700 font-semibold pt-1.5'>{userData.phone}</p>
                    )}

                    <p className='pt-1.5'>Street Address</p>
                    {isEdit ? (
                        <div className='space-y-2'>
                            <input 
                                className='w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors' 
                                type="text"
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    address: { ...(prev.address || {}), line1: e.target.value }
                                }))}
                                value={userData.address?.line1 || ''}
                                placeholder="Street line 1"
                            />
                            <input 
                                className='w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors' 
                                type="text"
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    address: { ...(prev.address || {}), line2: e.target.value }
                                }))}
                                value={userData.address?.line2 || ''}
                                placeholder="Street line 2"
                            />
                        </div>
                    ) : (
                        <p className='text-gray-700 leading-relaxed pt-1.5'>{userData.address?.line1} <br /> {userData.address?.line2}</p>
                    )}
                </div>
            </div>

            {/* Basic Information */}
            <div className='space-y-4 pt-2 border-t border-gray-50'>
                <h4 className='font-bold text-gray-800 text-sm uppercase tracking-wider border-l-4 border-purple-500 pl-2.5'>Basic Details</h4>
                <div className='grid grid-cols-1 sm:grid-cols-[1fr_2.5fr] gap-4 text-sm font-medium text-gray-500'>
                    <p className='pt-1.5'>Gender</p>
                    {isEdit ? (
                        <select 
                            className='w-full max-w-xs border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors font-bold'
                            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                            value={userData.gender}
                        >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    ) : (
                        <p className='text-gray-750 font-semibold pt-1.5'>{userData.gender}</p>
                    )}

                    <p className='pt-1.5'>Date of Birth</p>
                    {isEdit ? (
                        <input 
                            className='w-full max-w-xs border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition-colors font-bold' 
                            type='date'
                            onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                            value={userData.dob}
                        />
                    ) : (
                        <p className='text-gray-750 font-semibold pt-1.5'>{userData.dob}</p>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className='pt-4 border-t border-gray-50 flex justify-end gap-3'>
                {isEdit ? (
                    <>
                        <button 
                            onClick={() => { setIsEdit(false); setImage(false); }} 
                            className='px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-all'
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={updateUserProfileData} 
                            className='px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm'
                        >
                            Save Details
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsEdit(true)} 
                        className='px-6 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold text-xs rounded-xl transition-all duration-300'
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    ) : null
}

export default MyProfile
