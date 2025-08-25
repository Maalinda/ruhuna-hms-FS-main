"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "../firebase"
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  Building, 
  Home, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Users,
  RefreshCw,
  Shield,
  FilePlus,
  Layout
} from "lucide-react"
import HostelManagement from "../components/HostelManagement"
import RoomAssignmentModal from "../components/RoomAssignmentModal"

export default function AdminDashboard() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("applications")
  const [showRoomAssignment, setShowRoomAssignment] = useState(false)
  const [applicationToAssign, setApplicationToAssign] = useState(null)
  const [activateAnimation, setActivateAnimation] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })
  const [animationStaggerIndex, setAnimationStaggerIndex] = useState(0)

  useEffect(() => {
    async function fetchApplications() {
      try {
        const q = query(collection(db, "applications"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const applicationsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Safely handle the timestamp conversion
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

        // Calculate stats
        const pending = applicationsData.filter(app => app.status === "pending").length
        const approved = applicationsData.filter(app => app.status === "approved").length
        const rejected = applicationsData.filter(app => app.status === "rejected").length
        
        setStats({
          pending,
          approved,
          rejected,
          total: applicationsData.length
        })

        setApplications(applicationsData)
      } catch (error) {
        console.error("Error fetching applications:", error)
        setError("Failed to load applications. Please try again.")
      } finally {
        setLoading(false)
        setTimeout(() => setActivateAnimation(true), 100)
      }
    }

    fetchApplications()
  }, [])

  const getStaggeredDelay = (index) => {
    return `${100 + (index * 50)}ms`
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: newStatus,
        statusUpdatedAt: new Date().toISOString()
      })

      // Update application in state
      const updatedApplications = applications.map((app) => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
      setApplications(updatedApplications)

      // Update stats
      const pending = updatedApplications.filter(app => app.status === "pending").length
      const approved = updatedApplications.filter(app => app.status === "approved").length
      const rejected = updatedApplications.filter(app => app.status === "rejected").length
      
      setStats({
        pending,
        approved,
        rejected,
        total: updatedApplications.length
      })

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus })
      }
      
      // If approving, prompt for room assignment
      if (newStatus === "approved") {
        const appToAssign = applications.find(app => app.id === applicationId);
        if (appToAssign) {
          setApplicationToAssign(appToAssign);
          setShowRoomAssignment(true);
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error)
      setError("Failed to update application status. Please try again.")
    }
  }

  const handleRoomAssignmentComplete = (assignmentDetails) => {
    // Update local state with the room assignment details
    setApplications(applications.map((app) => 
      app.id === applicationToAssign.id 
        ? { 
            ...app, 
            hostelName: assignmentDetails.hostelName,
            roomNumber: assignmentDetails.roomNumber
          } 
        : app
    ))
    
    if (selectedApplication?.id === applicationToAssign.id) {
      setSelectedApplication({
        ...selectedApplication,
        hostelName: assignmentDetails.hostelName,
        roomNumber: assignmentDetails.roomNumber
      })
    }
    
    // Close the modal
    setShowRoomAssignment(false)
    setApplicationToAssign(null)
  }

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "applications", applicationId))

      const updatedApplications = applications.filter((app) => app.id !== applicationId)
      setApplications(updatedApplications)

      // Update stats
      const pending = updatedApplications.filter(app => app.status === "pending").length
      const approved = updatedApplications.filter(app => app.status === "approved").length
      const rejected = updatedApplications.filter(app => app.status === "rejected").length
      
      setStats({
        pending,
        approved,
        rejected,
        total: updatedApplications.length
      })

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(null)
      }
    } catch (error) {
      console.error("Error deleting application:", error)
      setError("Failed to delete application. Please try again.")
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesSearch =
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#4a2d5f] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-10 w-10 text-[#4a2d5f]/70" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm mt-2">Loading admin dashboard...</p>
          <div className="mt-3 flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-[#4a2d5f] animate-bounce" style={{animationDelay: "0ms"}}></div>
            <div className="h-2 w-2 rounded-full bg-[#4a2d5f] animate-bounce" style={{animationDelay: "150ms"}}></div>
            <div className="h-2 w-2 rounded-full bg-[#4a2d5f] animate-bounce" style={{animationDelay: "300ms"}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-purple-50/30 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className={`transition-all duration-700 ease-in-out transform ${activateAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#4a2d5f] to-[#e91e63] bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage accommodation applications and hostels</p>
            </div>
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
                onClick={() => window.location.reload()}
                className="bg-white hover:bg-red-50 text-red-700 py-2 px-4 rounded-lg border border-red-300 shadow-sm inline-flex items-center text-sm font-medium transition-colors sm:ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </button>
            </div>
          )}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: "Total Applications", value: stats.total, icon: <FilePlus className="h-6 w-6 text-blue-500" />, bgColor: "blue" },
              { title: "Pending", value: stats.pending, icon: <Clock className="h-6 w-6 text-yellow-500" />, bgColor: "yellow" },
              { title: "Approved", value: stats.approved, icon: <CheckCircle className="h-6 w-6 text-green-500" />, bgColor: "green" },
              { title: "Rejected", value: stats.rejected, icon: <XCircle className="h-6 w-6 text-red-500" />, bgColor: "red" }
            ].map((stat, index) => (
              <div 
                key={stat.title}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all hover:shadow-md hover:translate-y-[-2px] animate-fade-in-up"
                style={{ animationDelay: getStaggeredDelay(index) }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.bgColor}-50 rounded-full`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className={`bg-${stat.bgColor}-500 h-1.5 rounded-full`} 
                      style={{ width: `${(stat.value / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-4 py-3 font-medium rounded-t-lg transition-colors ${
                  activeTab === "applications"
                    ? "bg-white border-t border-l border-r border-gray-200 text-[#4a2d5f] font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4a2d5f]"
                    : "text-gray-600 hover:text-[#4a2d5f] hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Applications
                </div>
              </button>
              <button
                onClick={() => setActiveTab("hostels")}
                className={`px-4 py-3 font-medium rounded-t-lg transition-colors ${
                  activeTab === "hostels"
                    ? "bg-white border-t border-l border-r border-gray-200 text-[#4a2d5f] font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4a2d5f]"
                    : "text-gray-600 hover:text-[#4a2d5f] hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Hostels & Rooms
                </div>
              </button>
            </div>
          </div>

          {activeTab === "applications" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filters and Search */}
              <div className="lg:col-span-12 bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
                    <div className="w-full sm:w-1/3">
                      <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Filter className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        Filter by Status
                      </label>
                      <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent transition-colors bg-white"
                      >
                        <option value="all">All Applications</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="w-full sm:w-2/3">
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Search className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        Search Applications
                      </label>
                      <div className="relative">
                        <input
                          id="search"
                          type="text"
                          placeholder="Search by name, email, or university"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent transition-colors"
                        />
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3 justify-end">
                    <div className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                      Showing <span className="font-semibold text-[#4a2d5f]">{filteredApplications.length}</span> of <span className="font-semibold text-[#4a2d5f]">{applications.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications List */}
              <div className="lg:col-span-4 xl:col-span-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full animate-slide-in from-left">
                  <div className="bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Applications</h2>
                    <span className="text-sm bg-white/20 py-0.5 px-2.5 rounded-full">
                      {filteredApplications.length} Results
                    </span>
                  </div>

                  <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 350px)" }}>
                    {filteredApplications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Applications Found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
                        <button 
                          onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                          className="text-[#4a2d5f] hover:text-[#3a2248] font-medium transition-colors"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {filteredApplications.map((application, index) => (
                          <li
                            key={application.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 ${
                              selectedApplication?.id === application.id 
                                ? "bg-[#4a2d5f]/5 border-l-4 border-[#4a2d5f]" 
                                : ""
                            }`}
                            onClick={() => setSelectedApplication(application)}
                            style={{ 
                              animationDelay: getStaggeredDelay(index),
                              animation: activateAnimation ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                            }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-medium flex items-center text-gray-900">
                                  <User className="h-4 w-4 mr-1.5 text-gray-500" />
                                  {application.fullName}
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  {application.email}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                  <p className="text-xs text-gray-500 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                    {application.createdAt}
                                  </p>
                                  
                                  <div className="flex items-center">
                                    {application.hostelName && application.roomNumber && (
                                      <span className="flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mr-2">
                                        <Home className="h-3 w-3 mr-1" />
                                        Room {application.roomNumber}
                                      </span>
                                    )}
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center ${getStatusBadgeClass(application.status)}`}
                                    >
                                      {getStatusIcon(application.status)}
                                      <span className="ml-1">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="lg:col-span-8 xl:col-span-8">
                {selectedApplication ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full animate-slide-in from-right">
                    <div className="bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] p-4 text-white flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Application Details</h2>
                      <div className="flex space-x-2">
                        {selectedApplication.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(selectedApplication.id, "approved")}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors shadow-sm hover:shadow transform hover:translate-y-[-1px]"
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors shadow-sm hover:shadow transform hover:translate-y-[-1px]"
                            >
                              <XCircle className="h-4 w-4 mr-1.5" /> Reject
                            </button>
                          </>
                        )}
                        {selectedApplication.status === "approved" && !selectedApplication.hostelName && (
                          <button
                            onClick={() => {
                              setApplicationToAssign(selectedApplication);
                              setShowRoomAssignment(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors shadow-sm hover:shadow transform hover:translate-y-[-1px]"
                          >
                            <Building className="h-4 w-4 mr-1.5" /> Assign Room
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteApplication(selectedApplication.id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors shadow-sm hover:shadow transform hover:translate-y-[-1px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                        </button>
                      </div>
                    </div>

                    <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 350px)" }}>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${getStatusBadgeClass(
                            selectedApplication.status
                          )}`}
                        >
                          {getStatusIcon(selectedApplication.status)}
                          <span className="ml-1.5">{selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}</span>
                        </span>
                        
                        {selectedApplication.hostelName && selectedApplication.roomNumber && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 flex items-center">
                            <Home className="h-3.5 w-3.5 mr-1.5" />
                            {selectedApplication.hostelName}, Room {selectedApplication.roomNumber}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <User className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                            Personal Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Full Name</span>
                              <span className="font-medium text-gray-800">{selectedApplication.fullName}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Email</span>
                              <span className="font-medium text-gray-800">{selectedApplication.email}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Phone</span>
                              <span className="font-medium text-gray-800">{selectedApplication.phone}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Gender</span>
                              <span className="font-medium text-gray-800">{selectedApplication.gender}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Date of Birth</span>
                              <span className="font-medium text-gray-800">{selectedApplication.dateOfBirth}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Nationality</span>
                              <span className="font-medium text-gray-800">{selectedApplication.nationality}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <GraduationCap className="h-5 w-5 mr-2 text-[#e91e63]" />
                            Academic Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">University/College</span>
                              <span className="font-medium text-gray-800">{selectedApplication.university}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Course/Program</span>
                              <span className="font-medium text-gray-800">{selectedApplication.course}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Year of Study</span>
                              <span className="font-medium text-gray-800">{selectedApplication.yearOfStudy}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <Building className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                            Accommodation Preferences
                          </h3>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Room Preference</span>
                              <span className="font-medium text-gray-800">{selectedApplication.roomPreference}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Start Date</span>
                              <span className="font-medium text-gray-800">{selectedApplication.startDate}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Duration</span>
                              <span className="font-medium text-gray-800">{selectedApplication.duration}</span>
                            </div>
                            {selectedApplication.specialRequirements && (
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Special Requirements</span>
                                <span className="font-medium text-gray-800">{selectedApplication.specialRequirements}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <Phone className="h-5 w-5 mr-2 text-[#e91e63]" />
                            Emergency Contact
                          </h3>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Name</span>
                              <span className="font-medium text-gray-800">{selectedApplication.emergencyContactName}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Phone</span>
                              <span className="font-medium text-gray-800">{selectedApplication.emergencyContactPhone}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Relationship</span>
                              <span className="font-medium text-gray-800">{selectedApplication.emergencyContactRelation}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                      <Eye className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Application Selected</h3>
                    <p className="text-gray-600 max-w-md">
                       Choose an application from the list to see details and take action.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "hostels" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] p-4 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <Layout className="h-5 w-5 mr-2" />
                  Hostel Management
                </h2>
              </div>
              <div className="p-1">
                <HostelManagement />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Assignment Modal */}
      {showRoomAssignment && applicationToAssign && (
        <RoomAssignmentModal
          application={applicationToAssign}
          onClose={() => {
            setShowRoomAssignment(false);
            setApplicationToAssign(null);
          }}
          onComplete={handleRoomAssignmentComplete}
        />
      )}
    </div>
  )
}
