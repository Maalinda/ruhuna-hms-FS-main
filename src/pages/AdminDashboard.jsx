"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, addDoc } from "firebase/firestore"
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
  Layout,
  FileText,
  Download,
  ExternalLink,
  DollarSign,
  Award,
  MapPin,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  Calculator,
  Save,
  Edit3,
  CheckSquare,
  AlertTriangle,
  Bell,
  Plus,
  MessageSquare,
  Trash,
  Edit,
  Bug,
  AlertTriangle as AlertTriangleIcon
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
  const [distanceFilter, setDistanceFilter] = useState("all")
  const [incomeFilter, setIncomeFilter] = useState("all")
  const [marksFilter, setMarksFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("applications")
  const [showRoomAssignment, setShowRoomAssignment] = useState(false)
  const [applicationToAssign, setApplicationToAssign] = useState(null)
  const [activateAnimation, setActivateAnimation] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const [evaluationData, setEvaluationData] = useState({})
  const [savingEvaluation, setSavingEvaluation] = useState(false)
  const [notices, setNotices] = useState([])
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', type: 'info' })
  const [savingNotice, setSavingNotice] = useState(false)
  const [defectReports, setDefectReports] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch applications
        const appsQuery = query(collection(db, "applications"), orderBy("createdAt", "desc"))
        const appsSnapshot = await getDocs(appsQuery)

        const applicationsData = appsSnapshot.docs.map((doc) => {
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

        // Fetch defect reports
        const defectReportsQuery = query(collection(db, "defect_reports"), orderBy("createdAt", "desc"))
        const defectReportsSnapshot = await getDocs(defectReportsQuery)

        const defectReportsData = defectReportsSnapshot.docs.map((doc) => {
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

        setDefectReports(defectReportsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
        setTimeout(() => setActivateAnimation(true), 100)
      }
    }

    fetchData()
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
      app.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.district?.toLowerCase().includes(searchTerm.toLowerCase())

    // Distance filter logic
    let matchesDistance = true
    if (distanceFilter && app.distanceToFaculty) {
      const distance = parseFloat(app.distanceToFaculty)
      const filterValue = parseFloat(distanceFilter)
      if (!isNaN(filterValue)) {
        matchesDistance = distance > filterValue
      }
    }


    // Income filter logic
    let matchesIncome = true
    if (incomeFilter && (app.fatherIncome || app.motherIncome || app.guardianIncome)) {
      const fatherIncome = parseFloat(app.fatherIncome || 0)
      const motherIncome = parseFloat(app.motherIncome || 0)
      const guardianIncome = parseFloat(app.guardianIncome || 0)
      const totalIncome = fatherIncome + motherIncome + guardianIncome

      const filterValue = parseFloat(incomeFilter)
      if (!isNaN(filterValue)) {
        matchesIncome = totalIncome < filterValue
      }
    }

    // Marks filter logic
    let matchesMarks = true
    if (marksFilter !== "all") {
      switch (marksFilter) {
        case "not_evaluated":
          matchesMarks = !app.evaluation || !app.evaluation.totalMarks
          break
        case "under_100":
        case "100_to_200":
        case "200_to_300":
        case "300_to_400":
        case "above_300":
          // Only include applications that have been evaluated
          if (app.evaluation && app.evaluation.totalMarks) {
            const totalMarks = parseFloat(app.evaluation.totalMarks)
            switch (marksFilter) {
              case "under_100":
                matchesMarks = totalMarks < 100
                break
              case "100_to_200":
                matchesMarks = totalMarks >= 100 && totalMarks < 200
                break
              case "200_to_300":
                matchesMarks = totalMarks >= 200 && totalMarks < 300
                break
              case "300_to_400":
                matchesMarks = totalMarks >= 300 && totalMarks <= 400
                break
              case "above_300":
                matchesMarks = totalMarks > 300
                break
            }
          } else {
            // Application not evaluated, exclude from score-based filters
            matchesMarks = false
          }
          break
        default:
          matchesMarks = true
      }
    }

    return matchesStatus && matchesSearch && matchesDistance && matchesIncome && matchesMarks
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

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const openDocument = (url, filename) => {
    window.open(url, '_blank')
  }

  const handleEvaluationChange = (field, value) => {
    setEvaluationData(prev => ({
      ...prev,
      [field]: value,
      // Auto-calculate total when marks change
      ...(field.includes('Marks') ? {
        totalMarks: calculateTotal({
          ...prev,
          [field]: value
        })
      } : {})
    }))
  }

  const calculateTotal = (data) => {
    const distanceMarks = parseFloat(data.distanceMarks || 0)
    const incomeMarks = parseFloat(data.incomeMarks || 0)
    const specialReasonsParentMarks = parseFloat(data.specialReasonsParentMarks || 0)
    const specialReasonsMarks = parseFloat(data.specialReasonsMarks || 0)
    return (distanceMarks + incomeMarks + specialReasonsParentMarks + specialReasonsMarks).toFixed(1)
  }

  const saveEvaluation = async () => {
    if (!selectedApplication) return

    try {
      setSavingEvaluation(true)

      const evaluationWithTimestamp = {
        ...evaluationData,
        totalMarks: calculateTotal(evaluationData),
        evaluatedAt: serverTimestamp(),
        evaluatedBy: 'Current Admin' // You can replace with actual admin user info
      }

      // Determine new status based on final decision
      let newStatus = selectedApplication.status
      if (evaluationData.finalDecision === 'approve') {
        newStatus = 'approved'
      } else if (evaluationData.finalDecision === 'not_approve') {
        newStatus = 'rejected'
      }

      // Update both evaluation and status if final decision is made
      const updateData = {
        evaluation: evaluationWithTimestamp
      }

      if (newStatus !== selectedApplication.status) {
        updateData.status = newStatus
        updateData.statusUpdatedAt = new Date().toISOString()
      }

      await updateDoc(doc(db, "applications", selectedApplication.id), updateData)

      // Update local state
      const updatedApplications = applications.map(app =>
        app.id === selectedApplication.id
          ? { ...app, evaluation: evaluationWithTimestamp, status: newStatus }
          : app
      )
      setApplications(updatedApplications)

      // Update stats if status changed
      if (newStatus !== selectedApplication.status) {
        const pending = updatedApplications.filter(app => app.status === "pending").length
        const approved = updatedApplications.filter(app => app.status === "approved").length
        const rejected = updatedApplications.filter(app => app.status === "rejected").length

        setStats({
          pending,
          approved,
          rejected,
          total: updatedApplications.length
        })
      }

      if (selectedApplication) {
        setSelectedApplication({
          ...selectedApplication,
          evaluation: evaluationWithTimestamp,
          status: newStatus
        })
      }

      // If approved, trigger room assignment
      if (evaluationData.finalDecision === 'approve' && newStatus === 'approved') {
        setApplicationToAssign({
          ...selectedApplication,
          status: newStatus,
          evaluation: evaluationWithTimestamp
        })
        setShowRoomAssignment(true)
      }

      // Clear the evaluation form
      setEvaluationData({})

    } catch (error) {
      console.error("Error saving evaluation:", error)
      setError("Failed to save evaluation. Please try again.")
    } finally {
      setSavingEvaluation(false)
    }
  }

  const initializeEvaluationData = (application) => {
    if (application?.evaluation) {
      setEvaluationData(application.evaluation)
    } else {
      setEvaluationData({})
    }
  }

  const createNotice = async () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      setError("Please fill in both title and content for the notice.")
      return
    }

    try {
      setSavingNotice(true)

      const noticeData = {
        title: noticeForm.title.trim(),
        content: noticeForm.content.trim(),
        type: noticeForm.type,
        createdAt: serverTimestamp(),
        createdBy: 'Admin' // You can replace with actual admin user info
      }

      const docRef = await addDoc(collection(db, "notices"), noticeData)

      // Add to local state
      const newNotice = {
        id: docRef.id,
        ...noticeData,
        createdAt: new Date().toLocaleDateString()
      }

      setNotices(prevNotices => [newNotice, ...prevNotices])

      // Clear form
      setNoticeForm({ title: '', content: '', type: 'info' })

    } catch (error) {
      console.error("Error creating notice:", error)
      setError("Failed to create notice. Please try again.")
    } finally {
      setSavingNotice(false)
    }
  }

  const deleteNotice = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) {
      return
    }

    try {
      await deleteDoc(doc(db, "notices", noticeId))
      setNotices(prevNotices => prevNotices.filter(notice => notice.id !== noticeId))
    } catch (error) {
      console.error("Error deleting notice:", error)
      setError("Failed to delete notice. Please try again.")
    }
  }

  const updateDefectStatus = async (defectId, newStatus) => {
    try {
      await updateDoc(doc(db, "defect_reports", defectId), {
        status: newStatus,
        statusUpdatedAt: new Date().toISOString()
      })

      // Update defect report in state
      const updatedDefectReports = defectReports.map((report) =>
        report.id === defectId ? { ...report, status: newStatus } : report
      )
      setDefectReports(updatedDefectReports)
    } catch (error) {
      console.error("Error updating defect status:", error)
      setError("Failed to update defect status. Please try again.")
    }
  }

  const deleteDefectReport = async (defectId) => {
    if (!window.confirm("Are you sure you want to delete this defect report?")) {
      return
    }

    try {
      await deleteDoc(doc(db, "defect_reports", defectId))
      setDefectReports(prevReports => prevReports.filter(report => report.id !== defectId))
    } catch (error) {
      console.error("Error deleting defect report:", error)
      setError("Failed to delete defect report. Please try again.")
    }
  }

  const getDefectStatusBadgeClass = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "open":
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
    }
  }

  const getDefectPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "low":
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const handlePaymentApproval = async (applicationId, newStatus) => {
    try {
      const application = applications.find(app => app.id === applicationId)
      if (!application || !application.paymentInfo) {
        setError("Application or payment information not found.")
        return
      }

      const updateData = {
        paymentInfo: {
          ...application.paymentInfo,
          status: newStatus,
          ...(newStatus === 'approved' ? {
            approvedBy: 'Current Admin', // You can replace with actual admin user info
            approvedDate: new Date().toISOString()
          } : {
            rejectedBy: 'Current Admin', // You can replace with actual admin user info
            rejectedDate: new Date().toISOString(),
            rejectionReason: 'Invalid payment receipt' // You could add a prompt for reason
          })
        }
      }

      await updateDoc(doc(db, "applications", applicationId), updateData)

      // Update local state
      const updatedApplications = applications.map(app =>
        app.id === applicationId
          ? { ...app, paymentInfo: updateData.paymentInfo }
          : app
      )
      setApplications(updatedApplications)

      // Update selected application if it's the same one
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({
          ...selectedApplication,
          paymentInfo: updateData.paymentInfo
        })
      }

    } catch (error) {
      console.error("Error updating payment status:", error)
      setError("Failed to update payment status. Please try again.")
    }
  }

  // Initialize evaluation data when application is selected
  useEffect(() => {
    if (selectedApplication) {
      initializeEvaluationData(selectedApplication)
    }
  }, [selectedApplication])

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
            <div className="h-2 w-2 rounded-full bg-[#4a2d5f] animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="h-2 w-2 rounded-full bg-[#4a2d5f] animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="h-2 w-2 rounded-full bg-[#4a2d5f] animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-purple-50/30 to-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                className={`px-4 py-3 font-medium rounded-t-lg transition-colors ${activeTab === "applications"
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
                className={`px-4 py-3 font-medium rounded-t-lg transition-colors ${activeTab === "hostels"
                  ? "bg-white border-t border-l border-r border-gray-200 text-[#4a2d5f] font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4a2d5f]"
                  : "text-gray-600 hover:text-[#4a2d5f] hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Hostels & Rooms
                </div>
              </button>
              <button
                onClick={() => setActiveTab("notices")}
                className={`px-4 py-3 font-medium rounded-t-lg transition-colors ${activeTab === "notices"
                  ? "bg-white border-t border-l border-r border-gray-200 text-[#4a2d5f] font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4a2d5f]"
                  : "text-gray-600 hover:text-[#4a2d5f] hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notices
                </div>
              </button>
              <button
                onClick={() => setActiveTab("defects")}
                className={`px-4 py-3 font-medium rounded-t-lg transition-colors ${activeTab === "defects"
                  ? "bg-white border-t border-l border-r border-gray-200 text-[#4a2d5f] font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4a2d5f]"
                  : "text-gray-600 hover:text-[#4a2d5f] hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center">
                  <Bug className="h-4 w-4 mr-2" />
                  Defect Reports
                  {defectReports.filter(r => r.status === 'open').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {defectReports.filter(r => r.status === 'open').length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {activeTab === "applications" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filters and Search */}
              <div className="lg:col-span-12 bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 hover:shadow-md transition-all">
                <div className="space-y-4">
                  {/* First Row - Status and Search */}
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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
                            placeholder="Search by name, registration number, or department"
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

                  {/* Second Row - Distance, Income, and Marks Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-gray-100">
                    <div className="w-full sm:w-1/3">
                      <label htmlFor="distanceFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        Show Applications Over Distance (km)
                      </label>
                      <input
                        type="number"
                        id="distanceFilter"
                        value={distanceFilter}
                        onChange={(e) => setDistanceFilter(e.target.value)}
                        placeholder="Enter distance (e.g., 200)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent transition-colors bg-white"
                      />
                    </div>


                    <div className="w-full sm:w-1/3">
                      <label
                        htmlFor="incomeFilter"
                        className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                      >
                        <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        Show Applications Below Income (Rs.)
                      </label>
                      <input
                        type="number"
                        id="incomeFilter"
                        value={incomeFilter}
                        onChange={(e) => setIncomeFilter(e.target.value)}
                        placeholder="Enter income (e.g., 100000)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent transition-colors bg-white"
                      />
                    </div>


                    <div className="w-full sm:w-1/3">
                      <label htmlFor="marksFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calculator className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        Filter by Total Marks
                      </label>
                      <select
                        id="marksFilter"
                        value={marksFilter}
                        onChange={(e) => setMarksFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent transition-colors bg-white"
                      >
                        <option value="all">All Applications</option>
                        <option value="not_evaluated">Not Evaluated</option>
                        <option value="under_100">Under 100 marks</option>
                        <option value="100_to_200">100 - 199 marks</option>
                        <option value="200_to_300">200 - 299 marks</option>
                        <option value="300_to_400">300 - 400 marks</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setStatusFilter("all")
                        setSearchTerm("")
                        setDistanceFilter("all")
                        setIncomeFilter("all")
                        setMarksFilter("all")
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-[#4a2d5f] hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Clear All Filters
                    </button>
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
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 ${selectedApplication?.id === application.id
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
                                  <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  {application.registrationNumber || application.department}
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
                              <span className="text-xs font-medium text-gray-500">Name with Initials</span>
                              <span className="font-medium text-gray-800">{selectedApplication.nameWithInitials}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Mobile Number</span>
                              <span className="font-medium text-gray-800">{selectedApplication.mobileNumber}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Gender</span>
                              <span className="font-medium text-gray-800 capitalize">{selectedApplication.gender}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Marital Status</span>
                              <span className="font-medium text-gray-800 capitalize">{selectedApplication.maritalStatus}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">District</span>
                              <span className="font-medium text-gray-800">{selectedApplication.district}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Permanent Address</span>
                              <span className="font-medium text-gray-800">{selectedApplication.permanentAddress}</span>
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
                              <span className="text-xs font-medium text-gray-500">Faculty</span>
                              <span className="font-medium text-gray-800">{selectedApplication.faculty}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Department</span>
                              <span className="font-medium text-gray-800">{selectedApplication.department}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Registration Number</span>
                              <span className="font-medium text-gray-800">{selectedApplication.registrationNumber}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Present Level/Year</span>
                              <span className="font-medium text-gray-800">{selectedApplication.presentLevel}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Degree Type</span>
                              <span className="font-medium text-gray-800 capitalize">{selectedApplication.academicDegreeType}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <Building className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                            Residence Details
                          </h3>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Closest Town</span>
                              <span className="font-medium text-gray-800">{selectedApplication.closestTown}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Distance to Town (km)</span>
                              <span className="font-medium text-gray-800">{selectedApplication.distanceToTown}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Distance to Faculty (km)</span>
                              <span className="font-medium text-gray-800">{selectedApplication.distanceToFaculty}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Walking Distance to Bus Stop (km)</span>
                              <span className="font-medium text-gray-800">{selectedApplication.walkingDistanceToBusStop}</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Financial Information */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <DollarSign className="h-5 w-5 mr-2 text-[#e91e63]" />
                            Financial Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Receives Grant</span>
                              <span className={`font-medium ${selectedApplication.receivesGrant === 'yes' ? 'text-green-600' : 'text-gray-800'}`}>
                                {selectedApplication.receivesGrant === 'yes' ? 'Yes' : 'No'}
                              </span>
                            </div>
                            {selectedApplication.grantAmount && (
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Grant Amount (Rs.)</span>
                                <span className="font-medium text-gray-800">Rs. {selectedApplication.grantAmount}</span>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Father's Income (Rs.)</span>
                                <span className="font-medium text-gray-800">{selectedApplication.fatherIncome ? `Rs. ${selectedApplication.fatherIncome}` : 'Not provided'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Mother's Income (Rs.)</span>
                                <span className="font-medium text-gray-800">{selectedApplication.motherIncome ? `Rs. ${selectedApplication.motherIncome}` : 'Not provided'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Guardian's Income (Rs.)</span>
                                <span className="font-medium text-gray-800">{selectedApplication.guardianIncome ? `Rs. ${selectedApplication.guardianIncome}` : 'Not provided'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Receives Samurdhi</span>
                                <span className={`font-medium ${selectedApplication.receivesSamurdhi === 'yes' ? 'text-blue-600' : 'text-gray-800'}`}>
                                  {selectedApplication.receivesSamurdhi === 'yes' ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>

                            {/* Occupations */}
                            {(selectedApplication.fatherOccupation || selectedApplication.motherOccupation || selectedApplication.guardianOccupation) && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Family Occupations</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {selectedApplication.fatherOccupation && (
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500">Father's Occupation</span>
                                      <span className="font-medium text-gray-800">{selectedApplication.fatherOccupation}</span>
                                    </div>
                                  )}
                                  {selectedApplication.motherOccupation && (
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500">Mother's Occupation</span>
                                      <span className="font-medium text-gray-800">{selectedApplication.motherOccupation}</span>
                                    </div>
                                  )}
                                  {selectedApplication.guardianOccupation && (
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500">Guardian's Occupation</span>
                                      <span className="font-medium text-gray-800">{selectedApplication.guardianOccupation}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Academic Information */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <GraduationCap className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                            Academic Details
                          </h3>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Year of Applying</span>
                                <span className="font-medium text-gray-800 capitalize">{selectedApplication.yearOfApplying || 'Not specified'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Degree Type</span>
                                <span className="font-medium text-gray-800 capitalize">{selectedApplication.degreeType || selectedApplication.academicDegreeType || 'Not specified'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Faculty</span>
                                <span className="font-medium text-gray-800">{selectedApplication.faculty}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Department</span>
                                <span className="font-medium text-gray-800">{selectedApplication.department}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Registration Number</span>
                                <span className="font-medium text-gray-800">{selectedApplication.registrationNumber}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Present Level/Year</span>
                                <span className="font-medium text-gray-800">{selectedApplication.presentLevel ? `${selectedApplication.presentLevel}${selectedApplication.presentLevel === '1' ? 'st' : selectedApplication.presentLevel === '2' ? 'nd' : selectedApplication.presentLevel === '3' ? 'rd' : 'th'} Year` : 'Not specified'}</span>
                              </div>
                            </div>

                            <div className="flex flex-col pt-3 border-t border-gray-200">
                              <span className="text-xs font-medium text-gray-500">Misconduct/Misbehavior History</span>
                              <span className={`font-medium ${selectedApplication.hasMisconduct === 'no' ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedApplication.hasMisconduct === 'no' ? 'Clean Record' : selectedApplication.hasMisconduct === 'yes' ? 'Has Issues' : 'Not specified'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Previous Hostel Experience */}
                        {selectedApplication.receivedHostelBefore === 'yes' && (
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                              <Building className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                              Previous Hostel Experience
                            </h3>
                            <div className="space-y-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Previous Years</span>
                                <span className="font-medium text-gray-800">{selectedApplication.previousHostelYears || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Information */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                            <DollarSign className="h-5 w-5 mr-2 text-[#e91e63]" />
                            Payment Information
                          </h3>

                          {selectedApplication.paymentInfo ? (
                            <div className="space-y-4">
                              {/* Payment Status Header */}
                              <div className={`border rounded-lg p-4 ${selectedApplication.paymentInfo.status === 'approved'
                                  ? 'bg-green-50 border-green-200'
                                  : selectedApplication.paymentInfo.status === 'rejected'
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-yellow-50 border-yellow-200'
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center">
                                    {selectedApplication.paymentInfo.status === 'approved' ? (
                                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    ) : selectedApplication.paymentInfo.status === 'rejected' ? (
                                      <XCircle className="h-5 w-5 text-red-500 mr-3" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                                    )}
                                    <div>
                                      <span className={`font-semibold text-lg ${selectedApplication.paymentInfo.status === 'approved'
                                          ? 'text-green-800'
                                          : selectedApplication.paymentInfo.status === 'rejected'
                                            ? 'text-red-800'
                                            : 'text-yellow-800'
                                        }`}>
                                        {selectedApplication.paymentInfo.status === 'approved'
                                          ? 'Payment Approved'
                                          : selectedApplication.paymentInfo.status === 'rejected'
                                            ? 'Payment Rejected'
                                            : 'Payment Pending Review'
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  {selectedApplication.paymentInfo.status === 'pending' && (
                                    <div className="flex space-x-3">
                                      <button
                                        onClick={() => handlePaymentApproval(selectedApplication.id, 'approved')}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handlePaymentApproval(selectedApplication.id, 'rejected')}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Payment Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-600">Amount:</span>
                                      <span className="font-semibold text-gray-900 text-lg">
                                        {selectedApplication.paymentInfo.currency} {selectedApplication.paymentInfo.amount}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-600">Upload Date:</span>
                                      <span className="font-medium text-gray-800">
                                        {new Date(selectedApplication.paymentInfo.uploadDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-600">Receipt File:</span>
                                      <span className="font-medium text-gray-800 text-right max-w-32 truncate" title={selectedApplication.paymentInfo.fileName}>
                                        {selectedApplication.paymentInfo.fileName}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Row - Separate from grid */}
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Receipt Actions:</span>
                                    <div className="flex space-x-3">
                                      <a
                                        href={selectedApplication.paymentInfo.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Receipt
                                      </a>
                                      <a
                                        href={selectedApplication.paymentInfo.receiptUrl}
                                        download
                                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Approval Details */}
                              {selectedApplication.paymentInfo.status === 'approved' && selectedApplication.paymentInfo.approvedBy && (
                                <div className="bg-white border border-green-200 rounded-lg p-4">
                                  <h4 className="font-medium text-green-800 mb-2 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approval Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Approved by:</span>
                                      <span className="font-medium text-green-700">{selectedApplication.paymentInfo.approvedBy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Approved on:</span>
                                      <span className="font-medium text-green-700">{new Date(selectedApplication.paymentInfo.approvedDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Rejection Details */}
                              {selectedApplication.paymentInfo.status === 'rejected' && selectedApplication.paymentInfo.rejectedBy && (
                                <div className="bg-white border border-red-200 rounded-lg p-4">
                                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejection Details
                                  </h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Rejected by:</span>
                                        <span className="font-medium text-red-700">{selectedApplication.paymentInfo.rejectedBy}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Rejected on:</span>
                                        <span className="font-medium text-red-700">{new Date(selectedApplication.paymentInfo.rejectedDate).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                    {selectedApplication.paymentInfo.rejectionReason && (
                                      <div className="pt-2 border-t border-red-100">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Reason:</span>
                                          <span className="font-medium text-red-700 text-right flex-1 ml-3">{selectedApplication.paymentInfo.rejectionReason}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                              <div className="flex items-start">
                                <AlertTriangle className="h-6 w-6 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-orange-800 mb-2">Payment Pending</h4>
                                  <p className="text-orange-700 text-sm leading-relaxed">
                                    Student has not uploaded payment receipt yet. The annual hostel fee of <span className="font-medium">LKR 1,500</span> is required for accommodation services.
                                  </p>
                                  <div className="mt-3 text-xs text-orange-600">
                                    <p>• Students must upload bank receipt as proof of payment</p>
                                    <p>• Payment will be reviewed by admin before approval</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedApplication.siblings && selectedApplication.siblings.length > 0 && selectedApplication.siblings[0].name && (
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                              <Users className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                              Siblings Information
                            </h3>
                            <div className="space-y-3">
                              {selectedApplication.siblings.map((sibling, index) => (
                                sibling.name && (
                                  <div key={index} className="bg-white p-3 rounded border">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500">Name</span>
                                      <span className="font-medium text-gray-800">{sibling.name}</span>
                                    </div>
                                    <div className="flex flex-col mt-2">
                                      <span className="text-xs font-medium text-gray-500">School/University</span>
                                      <span className="font-medium text-gray-800">{sibling.schoolUniversity}</span>
                                    </div>
                                    <div className="flex flex-col mt-2">
                                      <span className="text-xs font-medium text-gray-500">Grade/Year</span>
                                      <span className="font-medium text-gray-800">{sibling.gradeYear}</span>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}

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
                            {selectedApplication.emergencyContactAddress && (
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Address</span>
                                <span className="font-medium text-gray-800">{selectedApplication.emergencyContactAddress}</span>
                              </div>
                            )}
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

                        {/* Sports Activities */}
                        {(selectedApplication.universityTeam || selectedApplication.receivedColors === 'yes') && (
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                              <Award className="h-5 w-5 mr-2 text-[#4a2d5f]" />
                              Sports Activities
                            </h3>
                            <div className="space-y-3">
                              {selectedApplication.universityTeam && (
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-500">University Team</span>
                                  <span className="font-medium text-gray-800">{selectedApplication.universityTeam}</span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Received University Colors</span>
                                <span className={`font-medium ${selectedApplication.receivedColors === 'yes' ? 'text-green-600' : 'text-gray-800'}`}>
                                  {selectedApplication.receivedColors === 'yes' ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Special Reasons */}
                        {selectedApplication.specialReasons && (
                          <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100 shadow-sm transform transition-all hover:shadow-md hover:translate-y-[-2px]">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                              <Info className="h-5 w-5 mr-2 text-blue-600" />
                              Special Reasons for Hostel Request
                            </h3>
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                              <p className="text-gray-800 leading-relaxed">{selectedApplication.specialReasons}</p>
                            </div>
                          </div>
                        )}

                        {/* Documents Section */}
                        <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-100 shadow-sm">
                          <button
                            onClick={() => toggleSection('documents')}
                            className="w-full flex items-center justify-between text-left"
                          >
                            <h3 className="text-lg font-semibold flex items-center text-gray-800">
                              <FileText className="h-5 w-5 mr-2 text-purple-600" />
                              Uploaded Documents
                              <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {[
                                  selectedApplication.gramaNiladhariRecommendationUrl,
                                  selectedApplication.physicalEducationRecommendationUrl,
                                  ...(selectedApplication.additionalDocumentsUrls || [])
                                ].filter(Boolean).length} files
                              </span>
                            </h3>
                            {expandedSections.documents ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </button>

                          {expandedSections.documents && (
                            <div className="mt-4 space-y-4">
                              {/* Grama Niladhari Recommendation */}
                              {selectedApplication.gramaNiladhariRecommendationUrl && (
                                <div className="bg-white p-4 rounded-lg border border-green-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Shield className="h-5 w-5 text-green-600 mr-3" />
                                      <div>
                                        <h4 className="font-medium text-gray-900">Grama Niladhari Recommendation</h4>
                                        <p className="text-sm text-gray-600">Official certification document</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => openDocument(selectedApplication.gramaNiladhariRecommendationUrl, 'grama-niladhari-recommendation')}
                                        className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View
                                      </button>
                                      <a
                                        href={selectedApplication.gramaNiladhariRecommendationUrl}
                                        download
                                        className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Physical Education Recommendation */}
                              {selectedApplication.physicalEducationRecommendationUrl && (
                                <div className="bg-white p-4 rounded-lg border border-orange-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Award className="h-5 w-5 text-orange-600 mr-3" />
                                      <div>
                                        <h4 className="font-medium text-gray-900">Physical Education Recommendation</h4>
                                        <p className="text-sm text-gray-600">Sports activities certification</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => openDocument(selectedApplication.physicalEducationRecommendationUrl, 'physical-education-recommendation')}
                                        className="flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View
                                      </button>
                                      <a
                                        href={selectedApplication.physicalEducationRecommendationUrl}
                                        download
                                        className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Additional Documents */}
                              {selectedApplication.additionalDocumentsUrls && selectedApplication.additionalDocumentsUrls.length > 0 && (
                                <div className="bg-white p-4 rounded-lg border border-purple-200">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                                    Additional Supporting Documents ({selectedApplication.additionalDocumentsUrls.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {selectedApplication.additionalDocumentsUrls.map((doc, index) => (
                                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                          <FileText className="h-4 w-4 text-gray-600 mr-3" />
                                          <div>
                                            <h5 className="font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</h5>
                                            <p className="text-xs text-gray-600">Supporting document</p>
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => openDocument(doc.url, doc.name || `additional-document-${index + 1}`)}
                                            className="flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                                          >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View
                                          </button>
                                          <a
                                            href={doc.url}
                                            download={doc.name}
                                            className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                                          >
                                            <Download className="h-3 w-3 mr-1" />
                                            Download
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* No Documents Message */}
                              {!selectedApplication.gramaNiladhariRecommendationUrl &&
                                !selectedApplication.physicalEducationRecommendationUrl &&
                                (!selectedApplication.additionalDocumentsUrls || selectedApplication.additionalDocumentsUrls.length === 0) && (
                                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600">No documents uploaded with this application</p>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        {/* Admin Evaluation Section */}
                        <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-100 shadow-sm">
                          <button
                            onClick={() => toggleSection('evaluation')}
                            className="w-full flex items-center justify-between text-left"
                          >
                            <h3 className="text-lg font-semibold flex items-center text-gray-800">
                              <Calculator className="h-5 w-5 mr-2 text-amber-600" />
                              Admin Evaluation & Approval
                              {selectedApplication.evaluation && (
                                <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Evaluated
                                </span>
                              )}
                            </h3>
                            {expandedSections.evaluation ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </button>

                          {expandedSections.evaluation && (
                            <div className="mt-4 space-y-6">
                              {/* Valuation Marks Section */}
                              <div className="bg-white p-5 rounded-lg border border-amber-200">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                  <Calculator className="h-5 w-5 mr-2 text-amber-600" />
                                  Valuation Marks
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Distance Based Marks */}
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Based on Distance
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={evaluationData.distanceMarks || ''}
                                        onChange={(e) => handleEvaluationChange('distanceMarks', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Enter marks"
                                      />
                                      <span className="text-sm text-gray-500">/ 100</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Distance to Faculty: {selectedApplication.distanceToFaculty} km
                                    </p>
                                  </div>

                                  {/* Income Based Marks */}
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Based on Income
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={evaluationData.incomeMarks || ''}
                                        onChange={(e) => handleEvaluationChange('incomeMarks', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Enter marks"
                                      />
                                      <span className="text-sm text-gray-500">/ 100</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Family Income: Father: Rs. {selectedApplication.fatherIncome || 'N/A'}, Mother: Rs. {selectedApplication.motherIncome || 'N/A'}
                                    </p>
                                  </div>

                                  {/* Special Reasons Related to Parent */}
                                  <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Special Reasons Related to Parents
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={evaluationData.specialReasonsParentMarks || ''}
                                        onChange={(e) => handleEvaluationChange('specialReasonsParentMarks', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Enter marks"
                                      />
                                      <span className="text-sm text-gray-500">/ 100</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Parent-related special circumstances
                                    </p>
                                  </div>

                                  {/* Special Reasons for Siblings */}
                                  <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Special Reasons Related to Brothers and Sisters
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={evaluationData.specialReasonsMarks || ''}
                                        onChange={(e) => handleEvaluationChange('specialReasonsMarks', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Enter marks"
                                      />
                                      <span className="text-sm text-gray-500">/ 100</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Siblings: {selectedApplication.siblings?.filter(s => s.name).length || 0} currently studying
                                    </p>
                                  </div>

                                  {/* Total Marks */}
                                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <label className="text-lg font-semibold text-gray-800">Total Marks:</label>
                                      <div className="text-2xl font-bold text-amber-600">
                                        {calculateTotal(evaluationData)} / 400
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Administrative Details */}
                              <div className="bg-white p-5 rounded-lg border border-blue-200">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                  <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
                                  Administrative Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Checked by</label>
                                    <input
                                      type="text"
                                      value={evaluationData.checkedBy || ''}
                                      onChange={(e) => handleEvaluationChange('checkedBy', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Enter name"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Signature of Sub Warden</label>
                                    <input
                                      type="text"
                                      value={evaluationData.subWardenSignature || ''}
                                      onChange={(e) => handleEvaluationChange('subWardenSignature', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Enter signature/name"
                                    />
                                  </div>
                                </div>
                              </div>


                              {/* Recommendation Section */}
                              <div className="bg-white p-5 rounded-lg border border-purple-200">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                  <CheckSquare className="h-5 w-5 mr-2 text-purple-600" />
                                  Warden/Registrar Recommendation
                                </h4>

                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Hostel Facility Recommendation</label>
                                    <select
                                      value={evaluationData.recommendation || ''}
                                      onChange={(e) => handleEvaluationChange('recommendation', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                      <option value="">Select recommendation</option>
                                      <option value="recommended">Recommended</option>
                                      <option value="not_recommended">Not Recommended</option>
                                      <option value="reconsider">To be Reconsidered with Information Requested</option>
                                    </select>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Signature of Warden or Sr. Assistant/Assistant Registrar</label>
                                    <input
                                      type="text"
                                      value={evaluationData.wardenSignature || ''}
                                      onChange={(e) => handleEvaluationChange('wardenSignature', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="Enter signature/name"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Final Approval Section */}
                              <div className="bg-white p-5 rounded-lg border border-green-200">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                  Final Decision
                                </h4>

                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Final Decision</label>
                                    <select
                                      value={evaluationData.finalDecision || ''}
                                      onChange={(e) => handleEvaluationChange('finalDecision', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                      <option value="">Select decision (can be done later)</option>
                                      <option value="approve">I Approve Hostel Facilities</option>
                                      <option value="not_approve">I Do Not Approve Hostel Facilities</option>
                                    </select>
                                  </div>

                                  {evaluationData.finalDecision && (
                                    <div className={`p-3 rounded-lg ${evaluationData.finalDecision === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                      <div className="flex items-center">
                                        {evaluationData.finalDecision === 'approve' ? (
                                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        ) : (
                                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                                        )}
                                        <span className={`font-medium ${evaluationData.finalDecision === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                                          {evaluationData.finalDecision === 'approve' ? 'Hostel facilities approved' : 'Hostel facilities not approved'}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Final Authority Signature</label>
                                    <input
                                      type="text"
                                      value={evaluationData.finalAuthoritySignature || ''}
                                      onChange={(e) => handleEvaluationChange('finalAuthoritySignature', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      placeholder="Enter signature/name"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Save Button */}
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => setEvaluationData({})}
                                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  Clear Application
                                </button>
                                <button
                                  onClick={saveEvaluation}
                                  disabled={savingEvaluation}
                                  className="flex items-center px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {savingEvaluation ? 'Saving...' : 'Save Evaluation'}
                                </button>
                              </div>

                              {/* Display Existing Evaluation */}
                              {selectedApplication.evaluation && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Current Evaluation Summary:</h5>
                                  <div className="text-sm text-gray-600">
                                    <p>Total Marks: <span className="font-medium">{selectedApplication.evaluation.totalMarks}/400</span></p>
                                    <p>Recommendation: <span className="font-medium capitalize">{selectedApplication.evaluation.recommendation?.replace('_', ' ') || 'Not set'}</span></p>
                                    <p>Final Decision: <span className="font-medium capitalize">{selectedApplication.evaluation.finalDecision?.replace('_', ' ') || 'Pending'}</span></p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
                    Select an application to review and process.
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
                  Hostel and Room Management
                </h2>
              </div>
              <div className="p-1">
                <HostelManagement />
              </div>
            </div>
          )}

          {activeTab === "notices" && (
            <div className="space-y-6">
              {/* Create Notice Form */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
                <div className="bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] p-4 text-white">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Notice
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type of the Notice
                      </label>
                      
                      <select
                        value={noticeForm.type}
                        onChange={(e) => setNoticeForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                      >
                        <option value="info">Information</option>
                        <option value="warning">Warning</option>
                        <option value="urgent">Urgent</option>
                        <option value="event">Event</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="achievement">Achievement</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title of the Notice
                      </label>
                      <input
                        type="text"
                        value={noticeForm.title}
                        onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                        placeholder="Enter notice title..."
                      />
                    </div>

                    {/* Set Expiry Date for the Notice */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="date"
                        value={noticeForm.expiryDate || ""}
                        onChange={(e) => setNoticeForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a2d5f]"
                      />
                    </div>  
                                                
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content of the Notice
                      </label>
                      <textarea
                        value={noticeForm.content}
                        onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                        placeholder="Enter notice content..."
                      />
                    </div>

                      {/* Pin Important Notices to the Top of the Dashboard */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={noticeForm.pinned || false}
                          onChange={(e) => setNoticeForm(prev => ({ ...prev, pinned: e.target.checked }))}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Pin to Top</label>
                      </div>          

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setNoticeForm({ title: '', content: '', type: 'info' })}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={createNotice}
                        disabled={savingNotice || !noticeForm.title.trim() || !noticeForm.content.trim()}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] text-white rounded-lg hover:from-[#3a2248] hover:to-[#5a3070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {savingNotice ? 'Creating...' : 'Create Notice'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notices List */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
                <div className="bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] p-4 text-white flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    All Notices
                  </h2>
                  <span className="text-sm bg-white/20 py-0.5 px-2.5 rounded-full">
                    {notices.length} Notice{notices.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {notices.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Notices to Display</h3>
                      <p className="text-gray-500">Create a new announcement for all students</p>
                    </div>
                  ) : (
                    notices.map((notice) => (
                      <div key={notice.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${notice.type === 'urgent' ? 'bg-red-100 text-red-800' :
                                notice.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  notice.type === 'success' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">{notice.createdAt}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                            <p className="text-gray-600 text-sm">{notice.content}</p>
                          </div>

                          <button
                            onClick={() => deleteNotice(notice.id)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete notice"
                          >
                            <Trash className="h-4 w-4" />
                          </button>

                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "defects" && (
            <div className="space-y-6">
              {/* Defect Reports Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  {
                    title: "Total Reports",
                    value: defectReports.length,
                    icon: <Bug className="h-5 w-5 text-gray-500" />,
                    bgColor: "gray"
                  },
                  {
                    title: "Open",
                    value: defectReports.filter(r => r.status === 'open').length,
                    icon: <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />,
                    bgColor: "yellow"
                  },
                  {
                    title: "In Progress",
                    value: defectReports.filter(r => r.status === 'in_progress').length,
                    icon: <Clock className="h-5 w-5 text-blue-500" />,
                    bgColor: "blue"
                  },
                  {
                    title: "Resolved",
                    value: defectReports.filter(r => r.status === 'resolved').length,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    bgColor: "green"
                  }
                ].map((stat, index) => (
                  <div
                    key={stat.title}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                        <p className="text-xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-2 bg-${stat.bgColor}-50 rounded-lg`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Defect Reports List */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#4a2d5f] to-[#6d4088] p-4 text-white flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Bug className="h-5 w-5 mr-2" />
                    Defect Reports
                  </h2>
                  <span className="text-sm bg-white/20 py-0.5 px-2.5 rounded-full">
                    {defectReports.length} Report{defectReports.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {defectReports.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Defect Reports</h3>
                      <p className="text-gray-500">No Defect Reports have been reported by students yet.</p>
                    </div>
                  ) : (
                    defectReports.map((report) => (
                      <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDefectStatusBadgeClass(report.status)}`}>
                                {report.status === 'in_progress' ? 'In Progress' : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDefectPriorityBadgeClass(report.priority)}`}>
                                {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                              </span>
                              <span className="text-sm text-gray-500">{report.createdAt}</span>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <Bug className="h-4 w-4 mr-2 text-gray-600" />
                              {report.subject}
                            </h3>

                            <div className="mb-3">
                              <span className="text-sm font-medium text-gray-700">Category: </span>
                              <span className="text-sm text-gray-600 capitalize">{report.category}</span>
                            </div>

                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{report.description}</p>

                            <div className="text-sm text-gray-500">
                              <p><span className="font-medium">Reported by:</span> {report.reporterName} ({report.reporterEmail})</p>
                            </div>
                          </div>

                          <div className="ml-6 flex flex-col space-y-2">
                            {report.status !== 'resolved' && (
                              <div className="flex flex-col space-y-1">
                                <select
                                  value={report.status}
                                  onChange={(e) => updateDefectStatus(report.id, e.target.value)}
                                  className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                                >
                                  <option value="open">Open</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </div>
                            )}

                            <button
                              onClick={() => deleteDefectReport(report.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                              title="Delete report"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Assignment Modal */}
      {showRoomAssignment && applicationToAssign && 
      (
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
