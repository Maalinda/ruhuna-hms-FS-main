"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Edit, 
  RefreshCw, 
  Building, 
  MapPin, 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Home,
  ChevronRight,
  GraduationCap,
  Bell,
  ArrowRight,
  DoorOpen,
  Lightbulb
} from "lucide-react"

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activateAnimation, setActivateAnimation] = useState(false)

  const fetchUserApplications = async () => {
    if (!currentUser) return
    
    setLoading(true)
    setError("")

    try {
      const q = query(
        collection(db, "applications"),
        where("userId", "==", currentUser.uid)
      )
      
      const querySnapshot = await getDocs(q)
      const applicationsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let formattedDate = "Unknown";
        if (data.createdAt) {
          try {
            formattedDate = data.createdAt.toDate().toLocaleDateString();
          } catch (e) {
            console.log("Error formatting date:", e);
            formattedDate = "Unknown";
          }
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: formattedDate
        };
      });

      applicationsData.sort((a, b) => {
        if (a.createdAt === "Unknown") return 1;
        if (b.createdAt === "Unknown") return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setApplications(applicationsData)
    } catch (error) {
      console.error("Error fetching applications:", error)
      setError("We encountered a problem loading your applications.")
    } finally {
      setLoading(false)
      setTimeout(() => setActivateAnimation(true), 100)
    }
  }

  useEffect(() => {
    fetchUserApplications()
  }, [currentUser])

  const getStatusIcon = (status) => {
    switch(status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case "approved":
        return "Your application has been approved!"
      case "rejected":
        return "Your application has been rejected."
      case "pending":
      default:
        return "Your application is under review."
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case "approved":
        return "bg-green-50 border-green-200"
      case "rejected":
        return "bg-red-50 border-red-200"
      case "pending":
      default:
        return "bg-yellow-50 border-yellow-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#4a2d5f] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-[#4a2d5f]/70" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm mt-2">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-700 ease-in-out transform ${activateAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your accommodation application and details</p>
            </div>
            
            {applications.length === 0 && (
              <Link 
                to="/apply" 
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white py-2.5 px-6 rounded-full font-medium shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-100"
              >
                <Edit className="h-4 w-4" /> 
                Apply for Accommodation
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl animate-pulse flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start">
                <div className="p-2 bg-red-100 rounded-full mr-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <span className="mt-0.5">{error}</span>
              </div>
              <button 
                onClick={fetchUserApplications}
                className="bg-white hover:bg-red-50 text-red-700 py-2 px-4 rounded-lg border border-red-300 shadow-sm inline-flex items-center text-sm font-medium transition-colors sm:ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Student Profile Card */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] p-4 text-white">
                  <h2 className="text-xl font-semibold">Student Profile</h2>
                </div>
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{currentUser?.displayName}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> 
                    {currentUser?.email}
                  </p>
                  
                  <div className="w-full pt-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-[#e91e63]/10 rounded-lg mr-3">
                          <Home className="h-5 w-5 text-[#e91e63]" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Accommodation Status</p>
                          <p className="text-sm font-semibold">
                            {applications.some(app => app.status === 'approved') 
                              ? 'Room Assigned' 
                              : applications.length > 0 
                                ? 'Application Pending'
                                : 'Not Applied'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-[#4a2d5f]/10 rounded-lg mr-3">
                          <Bell className="h-5 w-5 text-[#4a2d5f]" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Notifications</p>
                          <p className="text-sm font-semibold">
                            {applications.some(app => app.status === 'approved' && !app.hostelName) 
                              ? 'Room Assignment Pending'
                              : 'No New Notifications'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {applications.length === 0 && (
                    <Link 
                      to="/apply" 
                      className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e63] to-[#f05d78] text-white py-2.5 px-4 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <Edit className="h-4 w-4" /> 
                      Apply for Housing
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Resources Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold">Helpful Resources</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="p-1.5 bg-blue-100 rounded-md mr-3">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700">Hostel Regulations</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="p-1.5 bg-green-100 rounded-md mr-3">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">Campus Map</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="p-1.5 bg-purple-100 rounded-md mr-3">
                          <DoorOpen className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700">Hostel Facilities</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="p-1.5 bg-yellow-100 rounded-md mr-3">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                        </div>
                        <span className="text-gray-700">FAQ & Support</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Applications Panel */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] p-4 text-white flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Applications</h2>
                  <span className="text-sm bg-white/20 py-0.5 px-2.5 rounded-full">
                    {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                  </span>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">You haven't submitted any hostel applications yet. Apply now to secure your accommodation!</p>
                    <Link 
                      to="/apply" 
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e63] to-[#f05d78] text-white py-3 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
                    >
                      Apply for Housing <ArrowRight className="h-5 w-5 ml-1" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {applications.map((application, index) => (
                      <div 
                        key={application.id} 
                        className={`p-6 transition-all duration-500 ${
                          activateAnimation 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center">
                              <GraduationCap className="h-5 w-5 text-[#4a2d5f] mr-2" />
                              {application.fullName}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              <span>Applied on {application.createdAt}</span>
                            </div>
                          </div>
                          <div 
                            className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                              application.status === "approved" 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : application.status === "rejected"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {getStatusIcon(application.status)}
                            <span className="ml-1.5">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                          </div>
                        </div>

                        <div className={`border rounded-xl p-5 ${getStatusClass(application.status)}`}>
                          <div className="flex items-center mb-3">
                            {getStatusIcon(application.status)}
                            <span className="font-medium ml-2 text-lg">{getStatusText(application.status)}</span>
                          </div>
                          
                          {application.status === "approved" && (
                            <div>
                              <p className="text-green-700 mb-4">
                                Congratulations! Your application has been approved. You can now access all hostel facilities using your student ID.
                              </p>
                              
                              {application.hostelName && application.roomNumber ? (
                                <div className="mt-3 bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                                  <h4 className="font-medium flex items-center text-green-800 mb-3">
                                    <Building className="h-5 w-5 mr-2" />
                                    Room Assignment
                                  </h4>
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-start">
                                      <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="font-semibold text-gray-900">{application.hostelName}</p>
                                        <p className="text-gray-700">Room {application.roomNumber}</p>
                                        <p className="text-sm text-gray-600 mt-2">Please visit the administration office with your student ID to collect your room key.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
                                  <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-blue-800">Room Assignment Pending</p>
                                    <p className="text-blue-700 text-sm mt-1">
                                      Your room assignment is being processed. Please check back later or contact administration.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {application.status === "rejected" && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-red-800">Application Not Approved</p>
                                <p className="text-red-700 text-sm mt-1">
                                  Unfortunately, your application was approved. You may submit a new application or contact administration for more information.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {application.status === "pending" && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
                              <Clock className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-yellow-800">Under Review</p>
                                <p className="text-yellow-700 text-sm mt-1">
                                  Your application is currently being reviewed by our team. This process typically takes 3-5 business days.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h4 className="font-medium mb-4 flex items-center text-gray-800">
                            <FileText className="h-4 w-4 mr-2" />
                            Application Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <span className="text-xs font-medium text-gray-500 block mb-1">Room Preference</span>
                              <span className="font-medium text-gray-800">{application.roomPreference}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <span className="text-xs font-medium text-gray-500 block mb-1">Stay Duration</span>
                              <span className="font-medium text-gray-800">{application.duration}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <span className="text-xs font-medium text-gray-500 block mb-1">University</span>
                              <span className="font-medium text-gray-800">{application.university}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                              <span className="text-xs font-medium text-gray-500 block mb-1">Course</span>
                              <span className="font-medium text-gray-800">{application.course}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 