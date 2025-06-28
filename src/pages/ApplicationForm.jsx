"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function ApplicationForm() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    university: "", // This holds the Department value
    course: "",
    yearOfStudy: "",
    roomPreference: "single",
    specialRequirements: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    startDate: "",
    duration: "1-semester",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    async function checkApplicationStatus() {
      if (!currentUser) return

      try {
        const q = query(
          collection(db, "applications"),
          where("userId", "==", currentUser.uid)
        )

        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          navigate("/dashboard")
        }
      } catch (error) {
        console.error("Error checking application status:", error)
        setError("Failed to check your application status. Please try again.")
      } finally {
        setCheckingStatus(false)
      }
    }

    checkApplicationStatus()
  }, [currentUser, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setError("")
      setLoading(true)

      await addDoc(collection(db, "applications"), {
        ...formData,
        userId: currentUser.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      setSuccess(true)

      setTimeout(() => {
        navigate("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Error submitting application:", error)
      setError("Failed to submit application. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your application. We will review it and get back to you soon.
              </p>
              <p className="text-gray-500">You will be redirected to the dashboard in a few seconds...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#4a2d5f] py-4 px-6">
            <h2 className="text-2xl font-bold text-white">Hostel Application Form</h2>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required className="form-input" />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="form-input" />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="form-input" />
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="form-label">Gender</label>
                    <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="form-input">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* DOB */}
                  <div>
                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                    <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required className="form-input" />
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="nationality" className="form-label">District</label>
                    <input id="nationality" name="nationality" type="text" value={formData.nationality} onChange={handleChange} required className="form-input" />
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department (select) */}
                  <div>
                    <label htmlFor="university" className="form-label">Department</label>
                    <select id="university" name="university" value={formData.university} onChange={handleChange} required className="form-input">
                      <option value="">Select Department</option>
                      <option value="Civil and Environmental Engineering">Civil and Environmental Engineering</option>
                      <option value="Electrical and Information Engineering">Electrical and Information Engineering</option>
                      <option value="Mechanical and Manufacturing Engineering">Mechanical and Manufacturing Engineering</option>
                      <option value="Marine Engineering and Naval Architecture">Marine Engineering and Naval Architecture</option>
                      <option value="Computer Engineering">Computer Engineering</option>
                    </select>
                  </div>

                  {/* Reg No */}
                  <div>
                    <label htmlFor="course" className="form-label">Registration Number</label>
                    <input id="course" name="course" type="text" value={formData.course} onChange={handleChange} required className="form-input" />
                  </div>

                  {/* Year of Study */}
                  <div>
                    <label htmlFor="yearOfStudy" className="form-label">Year of Study</label>
                    <select id="yearOfStudy" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} required className="form-input">
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Accommodation Preferences */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Accommodation Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="roomPreference" className="form-label">Room Preference</label>
                    <select id="roomPreference" name="roomPreference" value={formData.roomPreference} onChange={handleChange} required className="form-input">
                      <option value="single">Single Room</option>
                      <option value="shared">Shared Room</option>
                      <option value="studio">Studio Apartment</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="startDate" className="form-label">Preferred Start Date</label>
                    <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="duration" className="form-label">Duration of Stay</label>
                    <select id="duration" name="duration" value={formData.duration} onChange={handleChange} required className="form-input">
                      <option value="1-semester">1 Semester</option>
                      <option value="2-semesters">2 Semesters</option>
                      <option value="1-year">1 Year</option>
                      <option value="more-than-1-year">More than 1 Year</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="specialRequirements" className="form-label">Special Requirements or Preferences</label>
                    <textarea id="specialRequirements" name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} rows="3" className="form-input" placeholder="Any specific requirements or preferences you have"></textarea>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emergencyContactName" className="form-label">Contact Name</label>
                    <input id="emergencyContactName" name="emergencyContactName" type="text" value={formData.emergencyContactName} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="emergencyContactPhone" className="form-label">Contact Phone</label>
                    <input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="emergencyContactRelation" className="form-label">Relationship</label>
                    <input id="emergencyContactRelation" name="emergencyContactRelation" type="text" value={formData.emergencyContactRelation} onChange={handleChange} required className="form-input" />
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="flex items-center">
                <input id="terms" type="checkbox" required className="h-4 w-4 text-[#4a2d5f] focus:ring-[#4a2d5f] border-gray-300 rounded" />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the terms and conditions and confirm that all information provided is accurate.
                </label>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
