"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
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
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Phone,
  Users,
  DollarSign,
  Award,
  Shield,
  Heart,
  Info,
  Eye,
  EyeOff,
  MessageSquare,
  Bug,
  Send,
  AlertTriangle as AlertTriangleIcon
} from "lucide-react"

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const [applications, setApplications] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activateAnimation, setActivateAnimation] = useState(false)
  const [expandedApplications, setExpandedApplications] = useState({})
  const [defectForm, setDefectForm] = useState({ category: '', priority: 'medium', subject: '', description: '' })
  const [submittingDefect, setSubmittingDefect] = useState(false)
  const [showDefectForm, setShowDefectForm] = useState(false)

  const fetchUserApplications = async () => {
    if (!currentUser) return
    
    setLoading(true)
    setError("")

    try {
      // Fetch applications
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

      // Fetch notices
      const noticesQuery = query(collection(db, "notices"), orderBy("createdAt", "desc"))
      const noticesSnapshot = await getDocs(noticesQuery)
      
      const noticesData = noticesSnapshot.docs.map((doc) => {
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
      })

      setNotices(noticesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("We encountered a problem loading your data.")
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

  const toggleApplicationExpanded = (applicationId) => {
    setExpandedApplications(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }))
  }

  const submitDefectReport = async () => {
    if (!defectForm.subject.trim() || !defectForm.description.trim() || !defectForm.category) {
      setError("Please fill in all required fields for the defect report.")
      return
    }

    try {
      setSubmittingDefect(true)
      
      const defectData = {
        category: defectForm.category,
        priority: defectForm.priority,
        subject: defectForm.subject.trim(),
        description: defectForm.description.trim(),
        status: 'open',
        reportedBy: currentUser.uid,
        reporterName: currentUser.displayName || 'Unknown',
        reporterEmail: currentUser.email,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, "defect_reports"), defectData)
      
      // Clear form and close modal
      setDefectForm({ category: '', priority: 'medium', subject: '', description: '' })
      setShowDefectForm(false)
      
      // Show success message (you can replace this with a toast notification)
      alert("Defect report submitted successfully! We will look into it shortly.")
      
    } catch (error) {
      console.error("Error submitting defect report:", error)
      setError("Failed to submit defect report. Please try again.")
    } finally {
      setSubmittingDefect(false)
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

          {/* Notices Section */}
          {notices.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up mb-8">
              <div className="bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] p-4 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notice Board
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        notice.type === 'urgent' ? 'bg-red-100' :
                        notice.type === 'warning' ? 'bg-yellow-100' :
                        notice.type === 'success' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        {notice.type === 'urgent' ? (
                          <AlertCircle className={`h-4 w-4 ${
                            notice.type === 'urgent' ? 'text-red-600' :
                            notice.type === 'warning' ? 'text-yellow-600' :
                            notice.type === 'success' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />
                        ) : (
                          <Bell className={`h-4 w-4 ${
                            notice.type === 'urgent' ? 'text-red-600' :
                            notice.type === 'warning' ? 'text-yellow-600' :
                            notice.type === 'success' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notice.type === 'urgent' ? 'bg-red-100 text-red-800' :
                            notice.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            notice.type === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">{notice.createdAt}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{notice.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {notices.length > 3 && (
                  <div className="p-4 bg-gray-50 text-center">
                    <p className="text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      {notices.length - 3} more notice{notices.length - 3 !== 1 ? 's' : ''} available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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
                  
                  {/* Report Issue Button */}
                  <button
                    onClick={() => setShowDefectForm(true)}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Bug className="h-4 w-4" />
                    Report Issue
                  </button>
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
                                  Unfortunately, your application was not approved. You may submit a new application or contact administration for more information.
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

                        {/* Enhanced Application Details Section */}
                        <div className="mt-4 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                          <button
                            onClick={() => toggleApplicationExpanded(application.id)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                          >
                            <h4 className="font-medium flex items-center text-gray-800">
                              <FileText className="h-4 w-4 mr-2" />
                              Application Details
                            </h4>
                            {expandedApplications[application.id] ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </button>

                          {expandedApplications[application.id] && (
                            <div className="px-5 pb-5 animate-in slide-in-from-top duration-200">
                              {/* Quick Overview */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Registration</span>
                                  <span className="font-medium text-gray-800">{application.registrationNumber || 'N/A'}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Department</span>
                                  <span className="font-medium text-gray-800">{application.department || 'N/A'}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Year/Level</span>
                                  <span className="font-medium text-gray-800">{application.presentLevel ? `${application.presentLevel}${application.presentLevel === '1' ? 'st' : application.presentLevel === '2' ? 'nd' : application.presentLevel === '3' ? 'rd' : 'th'} Year` : 'N/A'}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">District</span>
                                  <span className="font-medium text-gray-800">{application.district || 'N/A'}</span>
                                </div>
                              </div>

                              {/* Detailed Information Sections */}
                              <div className="space-y-4">
                                {/* Personal Information */}
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-500" />
                                    Personal Information
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 block">Full Name:</span>
                                      <span className="font-medium">{application.fullName || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Name with Initials:</span>
                                      <span className="font-medium">{application.nameWithInitials || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Mobile Number:</span>
                                      <span className="font-medium flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {application.mobileNumber || 'N/A'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Gender:</span>
                                      <span className="font-medium capitalize">{application.gender || 'N/A'}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                      <span className="text-gray-500 block">Permanent Address:</span>
                                      <span className="font-medium">{application.permanentAddress || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Academic Information */}
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-2 text-purple-500" />
                                    Academic Information
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 block">Degree Type:</span>
                                      <span className="font-medium capitalize">{application.degreeType || application.academicDegreeType || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Year of Applying:</span>
                                      <span className="font-medium capitalize">{application.yearOfApplying || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Misconduct History:</span>
                                      <span className={`font-medium capitalize ${application.hasMisconduct === 'no' ? 'text-green-600' : 'text-red-600'}`}>
                                        {application.hasMisconduct === 'no' ? 'Clean Record' : application.hasMisconduct === 'yes' ? 'Has Issues' : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Residence Details */}
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                                    Residence Details
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 block">Closest Town:</span>
                                      <span className="font-medium">{application.closestTown || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Distance to Town:</span>
                                      <span className="font-medium">{application.distanceToTown ? `${application.distanceToTown} km` : 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Distance to Faculty:</span>
                                      <span className="font-medium">{application.distanceToFaculty ? `${application.distanceToFaculty} km` : 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Financial Information */}
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                                    Financial Information
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 block">Receives Grant:</span>
                                      <span className={`font-medium ${application.receivesGrant === 'yes' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {application.receivesGrant === 'yes' ? `Yes${application.grantAmount ? ` (Rs. ${application.grantAmount})` : ''}` : 'No'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Family Receives Samurdhi:</span>
                                      <span className={`font-medium ${application.receivesSamurdhi === 'yes' ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {application.receivesSamurdhi === 'yes' ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                    {(application.fatherIncome || application.motherIncome) && (
                                      <>
                                        <div>
                                          <span className="text-gray-500 block">Father's Income:</span>
                                          <span className="font-medium">{application.fatherIncome ? `Rs. ${application.fatherIncome}` : 'N/A'}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500 block">Mother's Income:</span>
                                          <span className="font-medium">{application.motherIncome ? `Rs. ${application.motherIncome}` : 'N/A'}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Family Details */}
                                {application.siblings && application.siblings.length > 0 && application.siblings.some(s => s.name) && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                                    <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                      <Users className="h-4 w-4 mr-2 text-indigo-500" />
                                      Siblings ({application.siblings.filter(s => s.name).length})
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      {application.siblings.filter(s => s.name).map((sibling, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                          <span className="font-medium">{sibling.name}</span>
                                          <span className="text-gray-600 text-xs">
                                            {sibling.schoolUniversity} {sibling.gradeYear && `(${sibling.gradeYear})`}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Emergency Contact */}
                                {application.emergencyContactName && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                                    <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                                      Emergency Contact
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500 block">Name:</span>
                                        <span className="font-medium">{application.emergencyContactName}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block">Relationship:</span>
                                        <span className="font-medium">{application.emergencyContactRelation || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block">Phone:</span>
                                        <span className="font-medium flex items-center">
                                          <Phone className="h-3 w-3 mr-1" />
                                          {application.emergencyContactPhone || 'N/A'}
                                        </span>
                                      </div>
                                      {application.emergencyContactAddress && (
                                        <div className="md:col-span-2">
                                          <span className="text-gray-500 block">Address:</span>
                                          <span className="font-medium">{application.emergencyContactAddress}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Sports & Previous Hostel */}
                                {(application.universityTeam || application.receivedHostelBefore === 'yes') && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {application.universityTeam && (
                                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                          <Award className="h-4 w-4 mr-2 text-orange-500" />
                                          Sports Activities
                                        </h5>
                                        <div className="text-sm">
                                          <div className="mb-2">
                                            <span className="text-gray-500 block">University Team:</span>
                                            <span className="font-medium">{application.universityTeam}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 block">Received Colors:</span>
                                            <span className={`font-medium ${application.receivedColors === 'yes' ? 'text-green-600' : 'text-gray-600'}`}>
                                              {application.receivedColors === 'yes' ? 'Yes' : 'No'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {application.receivedHostelBefore === 'yes' && (
                                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                          <Building className="h-4 w-4 mr-2 text-cyan-500" />
                                          Previous Hostel
                                        </h5>
                                        <div className="text-sm">
                                          <span className="text-gray-500 block">Previous Years:</span>
                                          <span className="font-medium">{application.previousHostelYears || 'N/A'}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
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

      {/* Defect Report Modal */}
      {showDefectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <Bug className="h-5 w-5 mr-2" />
                Report an Issue
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Category *
                </label>
                <select
                  value={defectForm.category}
                  onChange={(e) => setDefectForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="furniture">Furniture</option>
                  <option value="maintenance">General Maintenance</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="security">Security</option>
                  <option value="internet">Internet/WiFi</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={defectForm.priority}
                  onChange={(e) => setDefectForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={defectForm.subject}
                  onChange={(e) => setDefectForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={defectForm.description}
                  onChange={(e) => setDefectForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Please provide detailed information about the issue, including location if applicable..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowDefectForm(false)
                    setDefectForm({ category: '', priority: 'medium', subject: '', description: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDefectReport}
                  disabled={submittingDefect || !defectForm.category || !defectForm.subject.trim() || !defectForm.description.trim()}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submittingDefect ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}