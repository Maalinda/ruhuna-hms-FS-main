"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, doc, updateDoc, increment } from "firebase/firestore"
import { db } from "../firebase"
import { AlertCircle, X, Check, Search, Building, Home, Users, Loader2, ArrowRight } from "lucide-react"

export default function RoomAssignmentModal({ application, onClose, onComplete }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hostels, setHostels] = useState([])
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    fetchHostels()
    // Trigger animation after component mounts
    setTimeout(() => setAnimateIn(true), 50)
  }, [application])

  const fetchHostels = async () => {
    try {
      setLoading(true)
      
      // Get hostels appropriate for the student's gender
      const hostelQuery = query(
        collection(db, "hostels"),
        where("gender", "==", application.gender)
      )
      
      const hostelSnapshot = await getDocs(hostelQuery)
      
      // Get rooms for each hostel
      const hostelData = await Promise.all(
        hostelSnapshot.docs.map(async (doc) => {
          const hostel = { id: doc.id, ...doc.data() }
          
          // Fetch rooms for this hostel
          const roomsSnapshot = await getDocs(
            collection(db, "hostels", doc.id, "rooms")
          )
          
          // Only include rooms that have space
          const rooms = roomsSnapshot.docs
            .map(roomDoc => ({
              id: roomDoc.id,
              ...roomDoc.data()
            }))
            .filter(room => room.occupancy < room.capacity)
          
          return { ...hostel, rooms }
        })
      )
      
      // Filter out hostels with no available rooms
      const hostelsWithAvailableRooms = hostelData.filter(
        hostel => hostel.rooms.length > 0
      )
      
      setHostels(hostelsWithAvailableRooms)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching hostels:", error)
      setError("Failed to load available hostels. Please try again.")
      setLoading(false)
    }
  }
  
  const assignRoom = async () => {
    if (!selectedHostel || !selectedRoom) {
      setError("Please select a hostel and room")
      return
    }
    
    try {
      setAssigning(true)
      
      // Update the application with hostel and room details
      await updateDoc(doc(db, "applications", application.id), {
        hostelId: selectedHostel.id,
        hostelName: selectedHostel.name,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        assignedAt: new Date().toISOString(),
      })
      
      // Update the room occupancy
      await updateDoc(
        doc(db, "hostels", selectedHostel.id, "rooms", selectedRoom.id),
        {
          occupancy: increment(1),
          residents: [...(selectedRoom.residents || []), {
            id: application.userId,
            name: application.fullName,
            applicationId: application.id,
            registrationNumber: application.registrationNumber,
            assignedDate: new Date().toISOString(),
            email: application.email || null,
            phone: application.mobileNumber || null,
            department: application.department || null
          }]
        }
      )
      
      setAssigning(false)
      
      if (onComplete) {
        onComplete({
          hostelName: selectedHostel.name,
          roomNumber: selectedRoom.roomNumber
        })
      }
    } catch (error) {
      console.error("Error assigning room:", error)
      setError("Failed to assign room. Please try again.")
      setAssigning(false)
    }
  }
  
  const filteredHostels = hostels.filter(hostel => 
    hostel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-4 bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] text-white rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Assign Room to {application.fullName}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-5 flex-grow">
          {error && (
            <div className="mb-5 bg-red-50 text-red-700 p-4 rounded-xl flex items-start border border-red-100 animate-pulse">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-700">
                  Assigning a room for <span className="font-semibold text-[#4a2d5f]">{application.fullName}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {application.gender === 'male' ? 'Male' : 'Female'} student · {application.university}
                </p>
              </div>
              <div className="bg-purple-100 text-[#4a2d5f] text-sm px-3 py-1 rounded-full font-medium flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {application.roomPreference || 'Any room'}
              </div>
            </div>
            
            <div className="relative mb-5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search hostels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent transition-colors"
              />
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-t-3 border-b-3 border-[#4a2d5f] animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building className="h-5 w-5 text-[#4a2d5f]/50" />
                  </div>
                </div>
                <p className="text-gray-500 mt-3 text-sm">Loading available hostels...</p>
              </div>
            ) : hostels.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-800 p-5 rounded-xl border border-yellow-100">
                <p className="font-medium flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  No Available Rooms
                </p>
                <p className="text-sm mt-2 ml-7">
                  There are no hostels with available rooms for {application.gender === 'male' ? 'male' : 'female'} students.
                  Please check back later or add rooms to existing hostels.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                    Available Hostels
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredHostels.map((hostel, index) => (
                      <div 
                        key={hostel.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${
                          selectedHostel?.id === hostel.id 
                            ? 'border-[#4a2d5f] bg-gradient-to-br from-purple-50 to-white shadow-md' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedHostel(hostel)
                          setSelectedRoom(null)
                        }}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${hostel.gender === 'male' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{hostel.name}</h3>
                            <div className="flex items-center mt-1">
                              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mr-2">
                                {hostel.rooms.length} room{hostel.rooms.length !== 1 ? 's' : ''} available
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {hostel.gender} only
                              </span>
                            </div>
                            {hostel.description && (
                              <p className="text-xs text-gray-500 mt-2">{hostel.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedHostel && (
                  <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <Home className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                        Rooms in {selectedHostel.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Select a room to assign
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedHostel.rooms.map((room, index) => (
                        <div
                          key={room.id}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${
                            selectedRoom?.id === room.id 
                              ? 'border-[#4a2d5f] bg-gradient-to-br from-purple-50 to-white shadow-md' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedRoom(room)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="font-medium text-lg text-gray-900">{room.roomNumber}</div>
                          <div className="flex justify-center items-center gap-1 mt-1">
                            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                              {room.capacity - room.occupancy} bed{room.capacity - room.occupancy !== 1 ? 's' : ''} free
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Floor {room.floor}</div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full" 
                                style={{ width: `${(room.occupancy / room.capacity) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {room.occupancy}/{room.capacity} occupied
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center">
            {selectedHostel && selectedRoom && (
              <div className="mr-4 text-sm text-gray-600">
                <span className="font-medium">{selectedHostel.name}</span>
                <ArrowRight className="inline-block mx-1 h-3 w-3" />
                <span className="font-medium">Room {selectedRoom.roomNumber}</span>
              </div>
            )}
            
            <button
              onClick={assignRoom}
              disabled={!selectedHostel || !selectedRoom || assigning || loading}
              className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                !selectedHostel || !selectedRoom || assigning || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] text-white hover:shadow-md'
              }`}
            >
              {assigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Assign Room
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 