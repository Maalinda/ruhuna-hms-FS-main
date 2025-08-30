"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore"
import { db, storage } from "../firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
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
  AlertTriangle as AlertTriangleIcon,
  // Add these missing icons:
  ShowerHead,
  Wifi,
  Droplets,
} from "lucide-react";

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
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentFile, setPaymentFile] = useState(null)
  const [uploadingPayment, setUploadingPayment] = useState(false)
  const [showRegulations, setShowRegulations] = useState(false);
  const [showCampusMap, setShowCampusMap] = useState(false);
  const [showHostelFacilities, setShowHostelFacilities] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

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

      // Check if user has approved application
      const hasApprovedApplication = applicationsData.some(app => app.status === 'approved');

      // Only fetch notices for approved students
      if (hasApprovedApplication) {
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
      } else {
        // Clear notices for non-approved students
        setNotices([])
      }
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
    // Check if user has approved application
    const hasApprovedApplication = applications.some(app => app.status === 'approved');
    if (!hasApprovedApplication) {
      setError("Issue reporting is only available for students with approved applications.")
      return
    }

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
const hostelRegulations = [
  {
    title: "Check-in and Check-out",
    rules: [
      "Check-in time: 6:00 AM to 10:00 PM",
      "Late entry requires prior permission from warden",
      "Guests must be registered at the front desk",
      "Maximum guest stay: 2 days with approval",
    ],
  },
  {
    title: "Room and Property Care",
    rules: [
      "Keep rooms clean and tidy at all times",
      "Report any damages immediately",
      "No modifications to room structure",
      "Room inspections may occur monthly",
    ],
  },
  {
    title: "Noise and Conduct",
    rules: [
      "Quiet hours: 10:00 PM to 6:00 AM",
      "No loud music or disturbances",
      "Respectful behavior toward staff and residents",
      "No alcohol or illegal substances",
    ],
  },
  {
    title: "Common Areas",
    rules: [
      "Clean up after using common facilities",
      "No personal items in common areas",
      "Study rooms: quiet environment only",
      "Kitchen facilities: clean after use",
    ],
  },
  {
    title: "Safety and Security",
    rules: [
      "Keep room doors locked when away",
      "Do not share room keys or access cards",
      "Report suspicious activities immediately",
      "Emergency procedures must be followed",
    ],
  },
  {
    title: "Internet and Technology",
    rules: [
      "Use WiFi responsibly and ethically",
      "No illegal downloads or activities",
      "Report technical issues to IT support",
      "Personal routers are not allowed",
    ],
  },
];

  const handlePaymentUpload = async (e) => {
    e.preventDefault()
    
    if (!paymentFile) {
      setError('Please select a payment receipt file')
      return
    }

    // Find the user's approved application
    const approvedApplication = applications.find(app => app.status === 'approved')
    if (!approvedApplication) {
      setError('No approved application found')
      return
    }

    setUploadingPayment(true)
    setError('')

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `payments/${currentUser.uid}/${Date.now()}_${paymentFile.name}`)
      await uploadBytes(storageRef, paymentFile)
      const downloadURL = await getDownloadURL(storageRef)

      // Update the specific application document with payment info
      const applicationRef = doc(db, 'applications', approvedApplication.id)
      await updateDoc(applicationRef, {
        paymentInfo: {
          receiptUrl: downloadURL,
          fileName: paymentFile.name,
          uploadDate: new Date().toISOString(),
          amount: 1500,
          currency: 'LKR',
          status: 'pending' // Set initial status as pending for admin approval
        }
      })

      setPaymentFile(null)
      setShowPaymentForm(false)
      alert('Payment receipt uploaded successfully!')
      
      // Refresh application data
      fetchUserApplications()
      
    } catch (error) {
      console.error('Error uploading payment receipt:', error)
      setError('Failed to upload payment receipt')
    } finally {
      setUploadingPayment(false)
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
        <div
          className={`transition-all duration-700 ease-in-out transform ${
            activateAnimation
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your accommodation application and details
              </p>
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

          {/* Notices Section - Only for approved students */}
          {applications.some((app) => app.status === "approved") &&
            notices.length > 0 && (
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
                        <div
                          className={`p-2 rounded-full ${
                            notice.type === "urgent"
                              ? "bg-red-100"
                              : notice.type === "warning"
                              ? "bg-yellow-100"
                              : notice.type === "success"
                              ? "bg-green-100"
                              : "bg-blue-100"
                          }`}
                        >
                          {notice.type === "urgent" ? (
                            <AlertCircle
                              className={`h-4 w-4 ${
                                notice.type === "urgent"
                                  ? "text-red-600"
                                  : notice.type === "warning"
                                  ? "text-yellow-600"
                                  : notice.type === "success"
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            />
                          ) : (
                            <Bell
                              className={`h-4 w-4 ${
                                notice.type === "urgent"
                                  ? "text-red-600"
                                  : notice.type === "warning"
                                  ? "text-yellow-600"
                                  : notice.type === "success"
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notice.type === "urgent"
                                  ? "bg-red-100 text-red-800"
                                  : notice.type === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : notice.type === "success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {notice.type.charAt(0).toUpperCase() +
                                notice.type.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {notice.createdAt}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {notice.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {notice.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notices.length > 3 && (
                    <div className="p-4 bg-gray-50 text-center">
                      <p className="text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4 inline mr-1" />
                        {notices.length - 3} more notice
                        {notices.length - 3 !== 1 ? "s" : ""} available
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
                  <h3 className="text-xl font-bold mb-1">
                    {currentUser?.displayName}
                  </h3>
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
                          <p className="text-xs text-gray-500 font-medium">
                            Accommodation Status
                          </p>
                          <p className="text-sm font-semibold">
                            {applications.some(
                              (app) => app.status === "approved"
                            )
                              ? "Room Assigned"
                              : applications.length > 0
                              ? "Application Pending"
                              : "Not Applied"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-[#4a2d5f]/10 rounded-lg mr-3">
                          <Bell className="h-5 w-5 text-[#4a2d5f]" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">
                            Notifications
                          </p>
                          <p className="text-sm font-semibold">
                            {applications.some(
                              (app) =>
                                app.status === "approved" && !app.hostelName
                            )
                              ? "Room Assignment Pending"
                              : "No New Notifications"}
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

                  {/* Report Issue Button - Only for approved students */}
                  {applications.some((app) => app.status === "approved") && (
                    <>
                      <button
                        onClick={() => setShowDefectForm(true)}
                        className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        <Bug className="h-4 w-4" />
                        Report Issue
                      </button>

                      {/* Payment Upload Button - Only for approved students who need to upload payment */}
                      {(() => {
                        const approvedApp = applications.find(
                          (app) => app.status === "approved"
                        );
                        const needsPaymentUpload =
                          !approvedApp?.paymentInfo ||
                          approvedApp?.paymentInfo?.status === "rejected";
                        return (
                          needsPaymentUpload && (
                            <button
                              onClick={() => setShowPaymentForm(true)}
                              className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white py-2.5 px-4 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                            >
                              <CreditCard className="h-4 w-4" />
                              {approvedApp?.paymentInfo?.status === "rejected"
                                ? "Re-upload Payment"
                                : "Upload Payment"}
                            </button>
                          )
                        );
                      })()}
                    </>
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
                      <button
                        onClick={() => setShowRegulations(true)}
                        className="w-full flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="p-1.5 bg-blue-100 rounded-md mr-3">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700">
                          Hostel Regulations
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setShowCampusMap(true)}
                        className="w-full flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="p-1.5 bg-green-100 rounded-md mr-3">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">Campus Map</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setShowHostelFacilities(true)}
                        className="w-full flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="p-1.5 bg-purple-100 rounded-md mr-3">
                          <DoorOpen className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700">Hostel Facilities</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setShowFAQ(true)}
                        className="w-full flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="p-1.5 bg-yellow-100 rounded-md mr-3">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                        </div>
                        <span className="text-gray-700">FAQ & Support</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </button>
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
                    {applications.length}{" "}
                    {applications.length === 1 ? "Application" : "Applications"}
                  </span>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Applications Yet
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      You haven't submitted any hostel applications yet. Apply
                      now to secure your accommodation!
                    </p>
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
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
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
                            <span className="ml-1.5">
                              {application.status.charAt(0).toUpperCase() +
                                application.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`border rounded-xl p-5 ${getStatusClass(
                            application.status
                          )}`}
                        >
                          <div className="flex items-center mb-3">
                            {getStatusIcon(application.status)}
                            <span className="font-medium ml-2 text-lg">
                              {getStatusText(application.status)}
                            </span>
                          </div>

                          {application.status === "approved" && (
                            <div>
                              <p className="text-green-700 mb-4">
                                Congratulations! Your application has been
                                approved. You can now access all hostel
                                facilities using your student ID.
                              </p>

                              {/* Payment Status */}
                              <div className="mb-4">
                                {application.paymentInfo ? (
                                  <div
                                    className={`border rounded-xl p-4 flex items-start ${
                                      application.paymentInfo.status ===
                                      "approved"
                                        ? "bg-green-50 border-green-200"
                                        : application.paymentInfo.status ===
                                          "rejected"
                                        ? "bg-red-50 border-red-200"
                                        : "bg-yellow-50 border-yellow-200"
                                    }`}
                                  >
                                    {application.paymentInfo.status ===
                                    "approved" ? (
                                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    ) : application.paymentInfo.status ===
                                      "rejected" ? (
                                      <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div>
                                      <p
                                        className={`font-medium ${
                                          application.paymentInfo.status ===
                                          "approved"
                                            ? "text-green-800"
                                            : application.paymentInfo.status ===
                                              "rejected"
                                            ? "text-red-800"
                                            : "text-yellow-800"
                                        }`}
                                      >
                                        {application.paymentInfo.status ===
                                        "approved"
                                          ? "Payment Approved"
                                          : application.paymentInfo.status ===
                                            "rejected"
                                          ? "Payment Rejected"
                                          : "Payment Under Review"}
                                      </p>
                                      <p
                                        className={`text-sm mt-1 ${
                                          application.paymentInfo.status ===
                                          "approved"
                                            ? "text-green-700"
                                            : application.paymentInfo.status ===
                                              "rejected"
                                            ? "text-red-700"
                                            : "text-yellow-700"
                                        }`}
                                      >
                                        {application.paymentInfo.status ===
                                        "approved"
                                          ? `LKR ${
                                              application.paymentInfo.amount
                                            } payment approved on ${new Date(
                                              application.paymentInfo.approvedDate
                                            ).toLocaleDateString()}`
                                          : application.paymentInfo.status ===
                                            "rejected"
                                          ? `Payment receipt was rejected. Please upload a valid receipt.`
                                          : `LKR ${
                                              application.paymentInfo.amount
                                            } payment receipt uploaded on ${new Date(
                                              application.paymentInfo.uploadDate
                                            ).toLocaleDateString()}. Awaiting admin approval.`}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start">
                                    <AlertCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-orange-800">
                                        Payment Required
                                      </p>
                                      <p className="text-orange-700 text-sm mt-1">
                                        Please upload your bank receipt showing
                                        payment of LKR 1,500 annual hostel fees.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {application.hostelName &&
                              application.roomNumber ? (
                                <div className="mt-3 bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                                  <h4 className="font-medium flex items-center text-green-800 mb-3">
                                    <Building className="h-5 w-5 mr-2" />
                                    Room Assignment
                                  </h4>
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-start">
                                      <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="font-semibold text-gray-900">
                                          {application.hostelName}
                                        </p>
                                        <p className="text-gray-700">
                                          Room {application.roomNumber}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                          Please visit the administration office
                                          with your student ID to collect your
                                          room key.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
                                  <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-blue-800">
                                      Room Assignment Pending
                                    </p>
                                    <p className="text-blue-700 text-sm mt-1">
                                      Your room assignment is being processed.
                                      Please check back later or contact
                                      administration.
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
                                <p className="font-medium text-red-800">
                                  Application Not Approved
                                </p>
                                <p className="text-red-700 text-sm mt-1">
                                  Unfortunately, your application was not
                                  approved. You may submit a new application or
                                  contact administration for more information.
                                </p>
                              </div>
                            </div>
                          )}

                          {application.status === "pending" && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
                              <Clock className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-yellow-800">
                                  Under Review
                                </p>
                                <p className="text-yellow-700 text-sm mt-1">
                                  Your application is currently being reviewed
                                  by our team. This process typically takes 3-5
                                  business days.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Application Details Section */}
                        <div className="mt-4 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                          <button
                            onClick={() =>
                              toggleApplicationExpanded(application.id)
                            }
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
                                  <span className="text-xs font-medium text-gray-500 block mb-1">
                                    Registration
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {application.registrationNumber || "N/A"}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">
                                    Department
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {application.department || "N/A"}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">
                                    Year/Level
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {application.presentLevel
                                      ? `${application.presentLevel}${
                                          application.presentLevel === "1"
                                            ? "st"
                                            : application.presentLevel === "2"
                                            ? "nd"
                                            : application.presentLevel === "3"
                                            ? "rd"
                                            : "th"
                                        } Year`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">
                                    District
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {application.district || "N/A"}
                                  </span>
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
                                      <span className="text-gray-500 block">
                                        Full Name:
                                      </span>
                                      <span className="font-medium">
                                        {application.fullName || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Name with Initials:
                                      </span>
                                      <span className="font-medium">
                                        {application.nameWithInitials || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Mobile Number:
                                      </span>
                                      <span className="font-medium flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {application.mobileNumber || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Gender:
                                      </span>
                                      <span className="font-medium capitalize">
                                        {application.gender || "N/A"}
                                      </span>
                                    </div>
                                    <div className="md:col-span-2">
                                      <span className="text-gray-500 block">
                                        Permanent Address:
                                      </span>
                                      <span className="font-medium">
                                        {application.permanentAddress || "N/A"}
                                      </span>
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
                                      <span className="text-gray-500 block">
                                        Degree Type:
                                      </span>
                                      <span className="font-medium capitalize">
                                        {application.degreeType ||
                                          application.academicDegreeType ||
                                          "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Year of Applying:
                                      </span>
                                      <span className="font-medium capitalize">
                                        {application.yearOfApplying || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Misconduct History:
                                      </span>
                                      <span
                                        className={`font-medium capitalize ${
                                          application.hasMisconduct === "no"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {application.hasMisconduct === "no"
                                          ? "Clean Record"
                                          : application.hasMisconduct === "yes"
                                          ? "Has Issues"
                                          : "N/A"}
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
                                      <span className="text-gray-500 block">
                                        Closest Town:
                                      </span>
                                      <span className="font-medium">
                                        {application.closestTown || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Distance to Town:
                                      </span>
                                      <span className="font-medium">
                                        {application.distanceToTown
                                          ? `${application.distanceToTown} km`
                                          : "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Distance to Faculty:
                                      </span>
                                      <span className="font-medium">
                                        {application.distanceToFaculty
                                          ? `${application.distanceToFaculty} km`
                                          : "N/A"}
                                      </span>
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
                                      <span className="text-gray-500 block">
                                        Receives Grant:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          application.receivesGrant === "yes"
                                            ? "text-green-600"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {application.receivesGrant === "yes"
                                          ? `Yes${
                                              application.grantAmount
                                                ? ` (Rs. ${application.grantAmount})`
                                                : ""
                                            }`
                                          : "No"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Family Receives Samurdhi:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          application.receivesSamurdhi === "yes"
                                            ? "text-blue-600"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {application.receivesSamurdhi === "yes"
                                          ? "Yes"
                                          : "No"}
                                      </span>
                                    </div>
                                    {(application.fatherIncome ||
                                      application.motherIncome) && (
                                      <>
                                        <div>
                                          <span className="text-gray-500 block">
                                            Father's Income:
                                          </span>
                                          <span className="font-medium">
                                            {application.fatherIncome
                                              ? `Rs. ${application.fatherIncome}`
                                              : "N/A"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500 block">
                                            Mother's Income:
                                          </span>
                                          <span className="font-medium">
                                            {application.motherIncome
                                              ? `Rs. ${application.motherIncome}`
                                              : "N/A"}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Family Details */}
                                {application.siblings &&
                                  application.siblings.length > 0 &&
                                  application.siblings.some((s) => s.name) && (
                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                      <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-indigo-500" />
                                        Siblings (
                                        {
                                          application.siblings.filter(
                                            (s) => s.name
                                          ).length
                                        }
                                        )
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        {application.siblings
                                          .filter((s) => s.name)
                                          .map((sibling, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                                            >
                                              <span className="font-medium">
                                                {sibling.name}
                                              </span>
                                              <span className="text-gray-600 text-xs">
                                                {sibling.schoolUniversity}{" "}
                                                {sibling.gradeYear &&
                                                  `(${sibling.gradeYear})`}
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
                                        <span className="text-gray-500 block">
                                          Name:
                                        </span>
                                        <span className="font-medium">
                                          {application.emergencyContactName}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block">
                                          Relationship:
                                        </span>
                                        <span className="font-medium">
                                          {application.emergencyContactRelation ||
                                            "N/A"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block">
                                          Phone:
                                        </span>
                                        <span className="font-medium flex items-center">
                                          <Phone className="h-3 w-3 mr-1" />
                                          {application.emergencyContactPhone ||
                                            "N/A"}
                                        </span>
                                      </div>
                                      {application.emergencyContactAddress && (
                                        <div className="md:col-span-2">
                                          <span className="text-gray-500 block">
                                            Address:
                                          </span>
                                          <span className="font-medium">
                                            {
                                              application.emergencyContactAddress
                                            }
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Sports & Previous Hostel */}
                                {(application.universityTeam ||
                                  application.receivedHostelBefore ===
                                    "yes") && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {application.universityTeam && (
                                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                          <Award className="h-4 w-4 mr-2 text-orange-500" />
                                          Sports Activities
                                        </h5>
                                        <div className="text-sm">
                                          <div className="mb-2">
                                            <span className="text-gray-500 block">
                                              University Team:
                                            </span>
                                            <span className="font-medium">
                                              {application.universityTeam}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 block">
                                              Received Colors:
                                            </span>
                                            <span
                                              className={`font-medium ${
                                                application.receivedColors ===
                                                "yes"
                                                  ? "text-green-600"
                                                  : "text-gray-600"
                                              }`}
                                            >
                                              {application.receivedColors ===
                                              "yes"
                                                ? "Yes"
                                                : "No"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {application.receivedHostelBefore ===
                                      "yes" && (
                                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                          <Building className="h-4 w-4 mr-2 text-cyan-500" />
                                          Previous Hostel
                                        </h5>
                                        <div className="text-sm">
                                          <span className="text-gray-500 block">
                                            Previous Years:
                                          </span>
                                          <span className="font-medium">
                                            {application.previousHostelYears ||
                                              "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Documents Section for Students */}
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-purple-500" />
                                    Your Uploaded Documents
                                  </h5>
                                  <div className="space-y-3">
                                    {/* Grama Niladhari Recommendation */}
                                    {application.gramaNiladhariRecommendationUrl && (
                                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center">
                                          <Shield className="h-4 w-4 text-green-600 mr-3" />
                                          <div>
                                            <h6 className="font-medium text-gray-900 text-sm">
                                              Grama Niladhari Recommendation
                                            </h6>
                                            <p className="text-xs text-gray-600">
                                              Official certification document
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() =>
                                              window.open(
                                                application.gramaNiladhariRecommendationUrl,
                                                "_blank"
                                              )
                                            }
                                            className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Physical Education Recommendation */}
                                    {application.physicalEducationRecommendationUrl && (
                                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex items-center">
                                          <Award className="h-4 w-4 text-orange-600 mr-3" />
                                          <div>
                                            <h6 className="font-medium text-gray-900 text-sm">
                                              Physical Education Recommendation
                                            </h6>
                                            <p className="text-xs text-gray-600">
                                              Sports activities certification
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() =>
                                              window.open(
                                                application.physicalEducationRecommendationUrl,
                                                "_blank"
                                              )
                                            }
                                            className="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition-colors"
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Additional Documents */}
                                    {application.additionalDocumentsUrls &&
                                      application.additionalDocumentsUrls
                                        .length > 0 && (
                                        <div className="space-y-2">
                                          <h6 className="font-medium text-gray-700 text-sm flex items-center">
                                            <Users className="h-4 w-4 text-purple-600 mr-2" />
                                            Additional Supporting Documents (
                                            {
                                              application
                                                .additionalDocumentsUrls.length
                                            }
                                            )
                                          </h6>
                                          {application.additionalDocumentsUrls.map(
                                            (doc, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                                              >
                                                <div className="flex items-center">
                                                  <FileText className="h-4 w-4 text-purple-600 mr-3" />
                                                  <div>
                                                    <h6 className="font-medium text-gray-900 text-sm">
                                                      {doc.name ||
                                                        `Document ${index + 1}`}
                                                    </h6>
                                                    <p className="text-xs text-gray-600">
                                                      Supporting document
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                  <button
                                                    onClick={() =>
                                                      window.open(
                                                        doc.url,
                                                        "_blank"
                                                      )
                                                    }
                                                    className="flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                                                  >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View
                                                  </button>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}

                                    {/* Payment Receipt */}
                                    {application.paymentInfo && (
                                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center">
                                          <CreditCard className="h-4 w-4 text-blue-600 mr-3" />
                                          <div>
                                            <h6 className="font-medium text-gray-900 text-sm">
                                              Payment Receipt
                                            </h6>
                                            <p className="text-xs text-gray-600">
                                              LKR{" "}
                                              {application.paymentInfo.amount} -{" "}
                                              {application.paymentInfo.fileName}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() =>
                                              window.open(
                                                application.paymentInfo
                                                  .receiptUrl,
                                                "_blank"
                                              )
                                            }
                                            className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* No Documents Message */}
                                    {!application.gramaNiladhariRecommendationUrl &&
                                      !application.physicalEducationRecommendationUrl &&
                                      (!application.additionalDocumentsUrls ||
                                        application.additionalDocumentsUrls
                                          .length === 0) &&
                                      !application.paymentInfo && (
                                        <div className="text-center py-6">
                                          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                          <p className="text-gray-500 text-sm">
                                            No documents uploaded
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                </div>
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
                  onChange={(e) =>
                    setDefectForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setDefectForm((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setDefectForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setDefectForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Please provide detailed information about the issue, including location if applicable..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowDefectForm(false);
                    setDefectForm({
                      category: "",
                      priority: "medium",
                      subject: "",
                      description: "",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDefectReport}
                  disabled={
                    submittingDefect ||
                    !defectForm.category ||
                    !defectForm.subject.trim() ||
                    !defectForm.description.trim()
                  }
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submittingDefect ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Upload Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Upload Payment Receipt
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Payment Information
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      Please upload your bank receipt showing payment of LKR
                      1,500 for annual hostel fees. Accepted formats: JPG, PNG,
                      PDF (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Receipt *
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setPaymentFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {paymentFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {paymentFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentUpload}
                  disabled={uploadingPayment || !paymentFile}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingPayment ? "Uploading..." : "Upload Receipt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hostel Regulations Modal */}
      {showRegulations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center">
                  <BookOpen className="h-6 w-6 mr-3" />
                  Hostel Regulations
                </h3>
                <button
                  onClick={() => setShowRegulations(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <p className="text-blue-100 mt-2">
                Please read and follow these regulations to ensure a pleasant
                stay for everyone.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostelRegulations.map((section, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-5 border border-gray-200"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {section.rules.map((rule, ruleIndex) => (
                        <li
                          key={ruleIndex}
                          className="flex items-start text-gray-700"
                        >
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm leading-relaxed">
                            {rule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {/* Important Notice */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-1">
                      Important Notice
                    </h5>
                    <p className="text-yellow-700 text-sm">
                      Violation of these regulations may result in warnings,
                      fines, or termination of hostel accommodation. For
                      clarifications, please contact the hostel administration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">
                      Need Help?
                    </h5>
                    <p className="text-blue-700 text-sm">
                      Contact the hostel warden or administration office for any
                      questions about these regulations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowRegulations(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Campus Map Modal */}
      {showCampusMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center">
                  <MapPin className="h-6 w-6 mr-3" />
                  Campus Map & Hostel Locations
                </h3>
                <button
                  onClick={() => setShowCampusMap(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <p className="text-green-100 mt-2">
                View the campus layout and hostel locations. Click the map to
                open in Google Maps.
              </p>
            </div>
            <div className="p-6">
              {/* Campus Map Image */}
              <div className="mb-6">
                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  <a
                    href="https://www.google.com/maps/search/faculty+of+engineering+university+of+ruhuna/@6.0796372,80.1909688,17.75z?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity"
                  >
                    <img
                      src="/images/Hostel Locations.png"
                      alt="Map showing hostel locations"
                      className="w-full h-[400px] object-cover"
                    />
                  </a>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Click the map above to open in Google Maps for detailed
                  navigation
                </p>
              </div>
              {/* Quick Location Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Academic Buildings
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Faculty of Engineering</li>
                    <li>• Faculty of Science</li>
                    <li>• Faculty of Management</li>
                    <li>• Library Complex</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Hostels & Accommodation
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Hostel A (Male)</li>
                    <li>• Hostel B (Female)</li>
                    <li>• Hostel C (Graduate)</li>
                    <li>• Guest House</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                    <DoorOpen className="h-4 w-4 mr-2" />
                    Facilities & Services
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Cafeteria & Dining</li>
                    <li>• Sports Complex</li>
                    <li>• Medical Center</li>
                    <li>• Administration Office</li>
                  </ul>
                </div>
              </div>
              {/* Emergency Contacts */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">
                      Emergency Locations
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-red-700 font-medium">
                          Security Office:
                        </span>
                        <span className="text-red-600 block">
                          Main Gate - Available 24/7
                        </span>
                      </div>
                      <div>
                        <span className="text-red-700 font-medium">
                          Medical Center:
                        </span>
                        <span className="text-red-600 block">
                          Near Administration Block
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">
                      Navigation Tips
                    </h5>
                    <p className="text-blue-700 text-sm">
                      Use campus landmarks like the main library, clock tower,
                      and central quadrangle for easy navigation. Campus
                      shuttles run every 30 minutes during peak hours.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <a
                  href="https://www.google.com/maps/search/faculty+of+engineering+university+of+ruhuna/@6.0796372,80.1909688,17.75z?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium inline-flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </a>
                <button
                  onClick={() => setShowCampusMap(false)}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hostel Facilities Modal */}
      {showHostelFacilities && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center">
                  <DoorOpen className="h-6 w-6 mr-3" />
                  Hostel Facilities
                </h3>
                <button
                  onClick={() => setShowHostelFacilities(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <p className="text-purple-100 mt-2">
                Explore the modern facilities and amenities available in our
                hostels.
              </p>
            </div>

            <div className="p-6">
              {/* Facilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Room Facilities */}
                <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    Room Facilities
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Individual beds with mattresses",
                      "Study desk and chair for each student",
                      "Wardrobe/storage space",
                      "Power outlets for electronics",
                      "Ceiling fans for ventilation",
                      "Windows with proper lighting",
                    ].map((facility, index) => (
                      <li
                        key={index}
                        className="flex items-start text-purple-700"
                      >
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">
                          {facility}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Common Areas */}
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Common Areas
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Spacious common room for relaxation",
                      "Study areas with charging points",
                      "Recreation and entertainment space",
                      "Notice boards for announcements",
                      "Seating areas for group discussions",
                      "Television and entertainment facilities",
                    ].map((facility, index) => (
                      <li
                        key={index}
                        className="flex items-start text-blue-700"
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">
                          {facility}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Washroom Facilities */}
                <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <ShowerHead className="h-5 w-5 mr-2" />
                    Washroom Facilities
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Clean and well-maintained washrooms",
                      "Individual shower facilities",
                      "Mirrors and wash basins",
                      "Hot water availability",
                      "Proper drainage and ventilation",
                      "Regular cleaning and maintenance",
                    ].map((facility, index) => (
                      <li
                        key={index}
                        className="flex items-start text-green-700"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">
                          {facility}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technology & Connectivity */}
                <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    <Wifi className="h-5 w-5 mr-2" />
                    Technology & Connectivity
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "High-speed WiFi throughout the hostel",
                      "Reliable internet connectivity",
                      "Power backup for essential services",
                      "Multiple charging points in rooms",
                      "Common area with laptop charging",
                      "Network support and maintenance",
                    ].map((facility, index) => (
                      <li
                        key={index}
                        className="flex items-start text-orange-700"
                      >
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">
                          {facility}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Additional Services */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security & Support Services
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    {[
                      "24/7 security monitoring",
                      "Controlled access system",
                      "Emergency support available",
                      "Warden supervision and guidance",
                    ].map((service, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">
                          {service}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-2">
                    {[
                      "Regular maintenance services",
                      "Complaint handling system",
                      "Lost and found services",
                      "Visitor registration facility",
                    ].map((service, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">
                          {service}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Facility Rules */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-2">
                      Facility Usage Guidelines
                    </h5>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Keep all facilities clean and tidy after use</li>
                      <li>
                        • Report any damages or maintenance issues immediately
                      </li>
                      <li>• Respect shared spaces and other residents</li>
                      <li>• Follow designated quiet hours in common areas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact for Issues */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">
                      Need Assistance?
                    </h5>
                    <p className="text-blue-700 text-sm">
                      For any facility-related issues or maintenance requests,
                      please contact the hostel warden or use the "Report Issue"
                      feature in your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowHostelFacilities(false)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* FAQ & Support Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center">
                  <Lightbulb className="h-6 w-6 mr-3" />
                  FAQ & Support
                </h3>
                <button
                  onClick={() => setShowFAQ(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <p className="text-yellow-100 mt-2">
                Find answers to common questions and get support for your hostel
                accommodation.
              </p>
            </div>
            <div className="p-6">
              {/* FAQ Sections */}
              <div className="space-y-6">
                {/* Application Process */}
                <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Application Process
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-2">
                        How do I apply for hostel accommodation?
                      </h5>
                      <p className="text-yellow-700 text-sm">
                        Click on "Apply for Accommodation" in your dashboard or
                        use the Apply button. Fill out all required information
                        including personal details, academic information, and
                        family details.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-2">
                        How long does the approval process take?
                      </h5>
                      <p className="text-yellow-700 text-sm">
                        The review process typically takes 3-5 business days.
                        You'll receive updates on your application status
                        through your dashboard.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-2">
                        Can I edit my application after submission?
                      </h5>
                      <p className="text-yellow-700 text-sm">
                        Once submitted, applications cannot be edited. If you
                        need to make changes, contact the administration office
                        immediately.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Room Assignment */}
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Room Assignment & Keys
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">
                        When will I get my room assignment?
                      </h5>
                      <p className="text-blue-700 text-sm">
                        Room assignments are made after application approval.
                        You'll see your hostel and room number in your dashboard
                        once assigned.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">
                        How do I collect my room key?
                      </h5>
                      <p className="text-blue-700 text-sm">
                        Visit the administration office with your student ID and
                        approval notification. Office hours are Monday-Friday,
                        8:00 AM - 4:00 PM.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">
                        Can I request a specific hostel or room?
                      </h5>
                      <p className="text-blue-700 text-sm">
                        Room assignments are made based on availability and
                        administrative criteria. Special requests can be
                        submitted but are not guaranteed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fees & Payments */}
                <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Fees & Payments
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">
                        How much does hostel accommodation cost?
                      </h5>
                      <p className="text-green-700 text-sm">
                        Accommodation is free for students. Only a small annual
                        fee of approximately Rs. 1000 is charged for the student
                        welfare fund.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">
                        When and how do I pay the welfare fund fee?
                      </h5>
                      <p className="text-green-700 text-sm">
                        The welfare fund fee is collected during the
                        registration process. Payment details will be provided
                        by the administration office.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-green-800 mb-2">
                        Are there any additional charges?
                      </h5>
                      <p className="text-green-700 text-sm">
                        No additional charges for basic accommodation. However,
                        damage to hostel property may result in repair costs.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Issues & Maintenance */}
                <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    <Bug className="h-5 w-5 mr-2" />
                    Issues & Maintenance
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-orange-800 mb-2">
                        How do I report maintenance issues?
                      </h5>
                      <p className="text-orange-700 text-sm">
                        Use the "Report Issue" button in your dashboard. Select
                        the appropriate category and provide detailed
                        information about the problem.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-orange-800 mb-2">
                        How quickly are issues resolved?
                      </h5>
                      <p className="text-orange-700 text-sm">
                        Response time depends on priority level. Urgent issues
                        are addressed within 24 hours, while routine maintenance
                        may take 2-5 days.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-orange-800 mb-2">
                        What if I have an emergency?
                      </h5>
                      <p className="text-orange-700 text-sm">
                        For emergencies, contact the security office at the main
                        gate (available 24/7) or the hostel warden immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rules & Regulations */}
                <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Rules & Regulations
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-purple-800 mb-2">
                        What are the check-in/check-out times?
                      </h5>
                      <p className="text-purple-700 text-sm">
                        Check-in is from 6:00 AM to 10:00 PM. Late entry
                        requires prior permission from the warden. Check the
                        Hostel Regulations for complete details.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-800 mb-2">
                        Can I have guests in my room?
                      </h5>
                      <p className="text-purple-700 text-sm">
                        Guests must be registered at the front desk and can stay
                        for a maximum of 2 days with approval. All visitors must
                        follow hostel rules.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-800 mb-2">
                        What happens if I violate hostel rules?
                      </h5>
                      <p className="text-purple-700 text-sm">
                        Violations may result in warnings, fines, or termination
                        of accommodation. Serious violations are reported to
                        academic authorities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Contact Support */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Need More Help?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">
                      Contact Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          Administration Office: Main Building
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          Office Hours: Mon-Fri, 8:00 AM - 4:00 PM
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          Security: Main Gate - 24/7
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">
                      Digital Support
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Bug className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          Report issues through your dashboard
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          Check notices for important updates
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          Use campus map for navigation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick Tips */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">
                      Quick Tips for New Students
                    </h5>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Keep your student ID with you at all times</li>
                      <li>• Read the hostel regulations thoroughly</li>
                      <li>• Save important contact numbers in your phone</li>
                      <li>• Join the student community groups for updates</li>
                      <li>• Report any issues promptly for quick resolution</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowFAQ(false)}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

