"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "../firebase"
import { AlertCircle, CheckCircle, XCircle, Trash2, Eye } from "lucide-react"

export default function AdminDashboard() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchApplications() {
      try {
        const q = query(collection(db, "applications"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const applicationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown",
        }))

        setApplications(applicationsData)
      } catch (error) {
        console.error("Error fetching applications:", error)
        setError("Failed to load applications. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: newStatus,
      })

      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating application status:", error)
      setError("Failed to update application status. Please try again.")
    }
  }

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "applications", applicationId))

      setApplications(applications.filter((app) => app.id !== applicationId))

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
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2d5f]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters and Search */}
          <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Status
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-input"
                  >
                    <option value="all">All Applications</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex-grow">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name, email, or university"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Total Applications: <span className="font-semibold">{applications.length}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Showing: <span className="font-semibold">{filteredApplications.length}</span> results
                </p>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-[#4a2d5f] text-white">
              <h2 className="text-xl font-semibold">Applications</h2>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
              {filteredApplications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No applications found.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <li
                      key={application.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedApplication?.id === application.id ? "bg-gray-100" : ""}`}
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{application.fullName}</h3>
                          <p className="text-sm text-gray-600">{application.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Applied: {application.createdAt}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApplication ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-[#4a2d5f] text-white flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Application Details</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(selectedApplication.id, "approved")}
                      className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600"
                      title="Approve"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                      className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                      title="Reject"
                    >
                      <XCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(selectedApplication.id)}
                      className="p-1 rounded-full bg-gray-500 text-white hover:bg-gray-600"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold">{selectedApplication.fullName}</h3>
                      <p className="text-gray-600">
                        {selectedApplication.email} | {selectedApplication.phone}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedApplication.status)}`}
                    >
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold text-lg mb-3">Personal Information</h4>
                      <dl className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Gender:</dt>
                          <dd className="col-span-2">{selectedApplication.gender}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Date of Birth:</dt>
                          <dd className="col-span-2">{selectedApplication.dateOfBirth}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Nationality:</dt>
                          <dd className="col-span-2">{selectedApplication.nationality}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold text-lg mb-3">Academic Information</h4>
                      <dl className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">University:</dt>
                          <dd className="col-span-2">{selectedApplication.university}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Course:</dt>
                          <dd className="col-span-2">{selectedApplication.course}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Year of Study:</dt>
                          <dd className="col-span-2">{selectedApplication.yearOfStudy}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold text-lg mb-3">Accommodation Preferences</h4>
                      <dl className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Room Type:</dt>
                          <dd className="col-span-2">{selectedApplication.roomPreference}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Start Date:</dt>
                          <dd className="col-span-2">{selectedApplication.startDate}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Duration:</dt>
                          <dd className="col-span-2">{selectedApplication.duration}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold text-lg mb-3">Emergency Contact</h4>
                      <dl className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Name:</dt>
                          <dd className="col-span-2">{selectedApplication.emergencyContactName}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Phone:</dt>
                          <dd className="col-span-2">{selectedApplication.emergencyContactPhone}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="text-gray-600">Relationship:</dt>
                          <dd className="col-span-2">{selectedApplication.emergencyContactRelation}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {selectedApplication.specialRequirements && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold text-lg mb-3">Special Requirements</h4>
                      <p className="text-gray-700">{selectedApplication.specialRequirements}</p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-lg mb-3">Application Status</h4>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleStatusChange(selectedApplication.id, "pending")}
                        className={`px-4 py-2 rounded-md ${
                          selectedApplication.status === "pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-yellow-100"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedApplication.id, "approved")}
                        className={`px-4 py-2 rounded-md ${
                          selectedApplication.status === "approved"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-green-100"
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                        className={`px-4 py-2 rounded-md ${
                          selectedApplication.status === "rejected"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-red-100"
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center h-full">
                <Eye className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-500">Select an application to view details</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
