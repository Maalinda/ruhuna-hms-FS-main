"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, doc, serverTimestamp, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "../firebase"
import {
  AlertCircle,
  Plus,
  Home,
  User,
  Users,
  CheckCircle,
  Pencil,
  Building,
  Briefcase,
  ArrowRight,
  RefreshCw,
  Layers,
  Trash2
} from "lucide-react"

export default function HostelManagement() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddHostelForm, setShowAddHostelForm] = useState(false)
  const [showAddRoomForm, setShowAddRoomForm] = useState(false)
  const [currentHostel, setCurrentHostel] = useState(null)
  const [activateAnimation, setActivateAnimation] = useState(false)
  
  const [newHostel, setNewHostel] = useState({
    name: "",
    gender: "male",
    totalRooms: 0,
    description: ""
  })
  
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    capacity: 4,
    floor: 1
  })

  useEffect(() => {
    fetchHostels()
    setTimeout(() => setActivateAnimation(true), 100)
  }, [])

  const fetchHostels = async () => {
    try {
      setLoading(true)
      const hostelSnapshot = await getDocs(collection(db, "hostels"))
      
      const hostelData = await Promise.all(hostelSnapshot.docs.map(async (hostelDoc) => {
        const hostel = { id: hostelDoc.id, ...hostelDoc.data() }
        
        // Fetch rooms for this hostel
        const roomsSnapshot = await getDocs(
          collection(db, "hostels", hostelDoc.id, "rooms")
        )
        
        const rooms = await Promise.all(roomsSnapshot.docs.map(async (roomDoc) => {
          const roomData = { id: roomDoc.id, ...roomDoc.data() }
          
          // If room has residents, check if they already have registration numbers
          // For new assignments, registration numbers are stored directly
          // For older data, we might need to fetch from applications
          if (roomData.residents && roomData.residents.length > 0) {
            const enrichedResidents = await Promise.all(
              roomData.residents.map(async (resident) => {
                // If registration number is already stored, use it
                if (resident.registrationNumber && resident.registrationNumber !== 'N/A') {
                  return resident
                }
                
                // Otherwise, try to fetch from application (for legacy data)
                try {
                  if (resident.applicationId) {
                    const appDocRef = doc(db, "applications", resident.applicationId)
                    const appDoc = await getDoc(appDocRef)
                    if (appDoc.exists()) {
                      const appData = appDoc.data()
                      return {
                        ...resident,
                        registrationNumber: appData.registrationNumber || 'N/A'
                      }
                    }
                  }
                  return { ...resident, registrationNumber: 'N/A' }
                } catch (error) {
                  console.error("Error fetching resident details:", error)
                  return { ...resident, registrationNumber: 'N/A' }
                }
              })
            )
            return { ...roomData, residents: enrichedResidents }
          }
          
          return roomData
        }))
        
        return { ...hostel, rooms }
      }))
      
      setHostels(hostelData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching hostels:", error)
      setError("Failed to load hostels. Please try again.")
      setLoading(false)
    }
  }

  const handleAddHostel = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const totalRoomsNum = parseInt(newHostel.totalRooms)
      if (isNaN(totalRoomsNum) || totalRoomsNum <= 0) {
        setError("Total rooms must be a positive number")
        setLoading(false)
        return
      }
      
      await addDoc(collection(db, "hostels"), {
        name: newHostel.name,
        gender: newHostel.gender,
        totalRooms: totalRoomsNum,
        description: newHostel.description,
        createdAt: serverTimestamp()
      })
      
      setNewHostel({
        name: "",
        gender: "male",
        totalRooms: 0,
        description: ""
      })
      
      setShowAddHostelForm(false)
      await fetchHostels()
      
    } catch (error) {
      console.error("Error adding hostel:", error)
      setError("Failed to add hostel. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddRoom = async (e) => {
    e.preventDefault()
    
    if (!currentHostel) return
    
    try {
      setLoading(true)
      
      const capacity = parseInt(newRoom.capacity)
      const floor = parseInt(newRoom.floor)
      
      if (isNaN(capacity) || capacity <= 0 || capacity > 4) {
        setError("Room capacity must be between 1 and 4")
        setLoading(false)
        return
      }
      
      if (isNaN(floor) || floor <= 0) {
        setError("Floor must be a positive number")
        setLoading(false)
        return
      }
      
      await addDoc(collection(db, "hostels", currentHostel.id, "rooms"), {
        roomNumber: newRoom.roomNumber,
        capacity: capacity,
        floor: floor,
        occupancy: 0,
        residents: [],
        createdAt: serverTimestamp()
      })
      
      setNewRoom({
        roomNumber: "",
        capacity: 4,
        floor: 1
      })
      
      setShowAddRoomForm(false)
      await fetchHostels()
      
    } catch (error) {
      console.error("Error adding room:", error)
      setError("Failed to add room. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  const startAddingRoom = (hostel) => {
    setCurrentHostel(hostel)
    setShowAddRoomForm(true)
  }

  const handleDeleteHostel = async (hostelId, hostelName) => {
    if (!window.confirm(`Are you sure you want to delete "${hostelName}" hostel? This will also delete all rooms in this hostel. This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      
      // Delete the hostel document (this will also delete all subcollections like rooms)
      await deleteDoc(doc(db, "hostels", hostelId))
      
      await fetchHostels()
      
    } catch (error) {
      console.error("Error deleting hostel:", error)
      setError("Failed to delete hostel. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (hostelId, roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete room "${roomNumber}"? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      
      // Delete the room document
      await deleteDoc(doc(db, "hostels", hostelId, "rooms", roomId))
      
      await fetchHostels()
      
    } catch (error) {
      console.error("Error deleting room:", error)
      setError("Failed to delete room. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && hostels.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4a2d5f]"></div>
          <p className="mt-3 text-sm text-gray-500">Loading hostels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add New Hostals</h2>
        <button 
          onClick={() => setShowAddHostelForm(!showAddHostelForm)}
          className="bg-white text-[#4a2d5f] px-3 py-1 rounded-lg text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all hover:translate-y-[-1px]"
        >
          <Plus className="w-4 h-4 mr-1" /> 
          Add Hostel
        </button>
      </div>

      {error && (
        <div className="m-4 bg-red-50 text-red-700 p-3 rounded-xl flex items-start border border-red-100 shadow-sm animate-pulse">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span>{error}</span>
            <button 
              onClick={() => fetchHostels()}
              className="ml-4 text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 flex items-center inline-flex"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </button>
          </div>
        </div>
      )}

      {showAddHostelForm && (
        <div className="p-4 border-b border-gray-100 animate-fade-in-up">
          <h3 className="font-medium mb-3 text-gradient">Add New Hostel</h3>
          <form onSubmit={handleAddHostel} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Name
              </label>
              <input
                type="text"
                value={newHostel.name}
                onChange={(e) => setNewHostel({...newHostel, name: e.target.value})}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent transition-all"
                placeholder="e.g. Hostel A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={newHostel.gender}
                onChange={(e) => setNewHostel({...newHostel, gender: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Rooms
              </label>
              <input
                type="number"
                value={newHostel.totalRooms}
                onChange={(e) => setNewHostel({...newHostel, totalRooms: e.target.value})}
                required
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newHostel.description}
                onChange={(e) => setNewHostel({...newHostel, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                rows="3"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddHostelForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#4a2d5f] text-white rounded-lg hover:bg-[#3a2248] text-sm font-medium transition-colors shadow-sm hover:shadow"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Plus className="h-4 w-4 mr-1.5" /> Add Hostel
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`p-4 ${activateAnimation ? 'animate-fade-in-up' : ''}`}>
        {hostels.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Hostels Found</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              You haven't added any hostels yet. Click the "Add Hostel" button to create your first hostel.
            </p>
            <button
              onClick={() => setShowAddHostelForm(true)}
              className="inline-flex items-center px-4 py-2 bg-[#4a2d5f] text-white rounded-lg hover:bg-[#3a2248] text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Hostel
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {hostels.map((hostel, index) => (
              <div 
                key={hostel.id} 
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`bg-gradient-to-r ${hostel.gender === 'male' ? 'from-blue-600 to-blue-700' : 'from-pink-500 to-pink-600'} p-4 text-white flex justify-between items-center`}>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    <h3 className="font-medium">{hostel.name}</h3>
                    <span className="ml-3 bg-white/20 py-0.5 px-2 rounded-full text-xs capitalize">
                      {hostel.gender}
                    </span>
                  </div>
                  <div className="text-sm flex items-center">
                    <span className="flex items-center mr-3">
                      <Layers className="h-4 w-4 mr-1" />
                      {hostel.rooms?.length || 0}/{hostel.totalRooms} Rooms
                    </span>
                    <button
                      onClick={() => startAddingRoom(hostel)}
                      className="bg-white text-blue-700 px-2 py-1 rounded-lg text-xs flex items-center font-medium ml-2 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Room
                    </button>
                    <button
                      onClick={() => handleDeleteHostel(hostel.id, hostel.name)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs flex items-center font-medium ml-2 transition-colors"
                      title="Delete Hostel"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {hostel.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {hostel.description}
                    </p>
                  )}
                  
                  {hostel.rooms && hostel.rooms.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                        <Home className="h-4 w-4 mr-1.5 text-gray-500" />
                        Rooms List
                      </h4>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Room No
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Floor
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacity
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Occupancy
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Residents
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {hostel.rooms.map((room) => (
                              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {room.roomNumber}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                                  {room.floor}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                                  {room.capacity}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                                  {room.occupancy}/{room.capacity}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                                  {room.occupancy < room.capacity ? (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Available
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Full
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-sm">
                                  {room.residents && room.residents.length > 0 ? (
                                    <div className="space-y-1">
                                      {room.residents.map((resident, index) => (
                                        <div key={index} className="flex items-center">
                                          <User className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                          <div className="min-w-0 flex-1">
                                            <div className="text-xs font-medium text-gray-900 truncate">
                                              {resident.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {resident.registrationNumber}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-400 italic">
                                      No residents
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => handleDeleteRoom(hostel.id, room.id, room.roomNumber)}
                                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded transition-colors"
                                    title={`Delete room ${room.roomNumber}`}
                                    disabled={room.occupancy > 0}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  {room.occupancy > 0 && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      Cannot delete (occupied)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-3">No rooms added yet</p>
                      <button
                        onClick={() => startAddingRoom(hostel)}
                        className="inline-flex items-center px-3 py-1.5 bg-[#4a2d5f] text-white rounded-lg hover:bg-[#3a2248] text-xs font-medium transition-colors"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Room
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddRoomForm && currentHostel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full animate-in">
            <div className="p-4 bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] text-white rounded-t-xl flex justify-between items-center">
              <h3 className="font-medium">Add Room to {currentHostel.name}</h3>
              <button 
                onClick={() => setShowAddRoomForm(false)}
                className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                    placeholder="e.g. A101"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <select
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRoomForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4a2d5f] text-white rounded-lg hover:bg-[#3a2248] text-sm font-medium transition-colors shadow-sm hover:shadow flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Plus className="h-4 w-4 mr-1.5" /> Add Room
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 