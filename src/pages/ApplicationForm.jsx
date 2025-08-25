"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../firebase"
import { AlertCircle, CheckCircle, Plus, Minus, Upload, FileText, Award, Shield, ArrowLeft, ArrowRight, Users } from "lucide-react"

export default function ApplicationForm() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    // Basic Information
    yearOfApplying: "",
    degreeType: "",
    faculty: "Faculty of Engineering",
    registrationNumber: "",
    fullName: currentUser?.displayName || "",
    nameWithInitials: "",
    permanentAddress: "",
    mobileNumber: "",
    gender: "",
    maritalStatus: "single",
    
    // Residence Details
    district: "",
    closestTown: "",
    distanceToTown: "",
    distanceToFaculty: "",
    walkingDistanceToBusStop: "",
    
    // Academic Details
    academicDegreeType: "",
    department: "",
    presentLevel: "",
    hasMisconduct: "no",
    
    // Financial Information
    receivesGrant: "no",
    grantAmount: "",
    
    // Family Details - Brothers/Sisters
    siblings: [{ name: "", schoolUniversity: "", gradeYear: "" }],
    
    // Family Income
    fatherIncome: "",
    motherIncome: "",
    guardianIncome: "",
    receivesSamurdhi: "no",
    fatherOccupation: "",
    motherOccupation: "",
    guardianOccupation: "",
    
    // Previous Hostel
    receivedHostelBefore: "no",
    previousHostelYears: "",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactAddress: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    
    // Sports Activities
    universityTeam: "",
    receivedColors: "no"
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Document upload states
  const [documents, setDocuments] = useState({
    gramaNiladhariRecommendation: null,
    physicalEducationRecommendation: null,
    additionalDocuments: []
  })
  const [specialReasons, setSpecialReasons] = useState("")

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

  const handleSiblingChange = (index, field, value) => {
    const updatedSiblings = [...formData.siblings]
    updatedSiblings[index][field] = value
    setFormData((prev) => ({
      ...prev,
      siblings: updatedSiblings,
    }))
  }

  const addSibling = () => {
    setFormData((prev) => ({
      ...prev,
      siblings: [...prev.siblings, { name: "", schoolUniversity: "", gradeYear: "" }],
    }))
  }

  const removeSibling = (index) => {
    if (formData.siblings.length > 1) {
      const updatedSiblings = formData.siblings.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        siblings: updatedSiblings,
      }))
    }
  }

  const handleDocumentUpload = (field, file) => {
    if (field === 'additionalDocuments') {
      setDocuments(prev => ({
        ...prev,
        additionalDocuments: [...prev.additionalDocuments, file]
      }))
    } else {
      setDocuments(prev => ({
        ...prev,
        [field]: file
      }))
    }
  }

  const removeDocument = (field, index = null) => {
    if (field === 'additionalDocuments' && index !== null) {
      setDocuments(prev => ({
        ...prev,
        additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index)
      }))
    } else {
      setDocuments(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const uploadFileToFirebase = async (file, path) => {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  }

  const handleStepSubmit = async (e) => {
    e.preventDefault()
    
    if (currentStep === 1) {
      // Validate required fields for step 1
      const requiredFields = ['registrationNumber', 'fullName', 'nameWithInitials', 'permanentAddress', 'mobileNumber', 'gender', 'district', 'closestTown', 'distanceToTown', 'distanceToFaculty', 'walkingDistanceToBusStop', 'department', 'presentLevel', 'emergencyContactName', 'emergencyContactAddress', 'emergencyContactPhone', 'emergencyContactRelation']
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          setError(`Please fill in all required fields in Step 1.`)
          return
        }
      }
      
      setCurrentStep(2)
      setError("")
    } else {
      // Step 2 - Final submission
      await handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async () => {
    try {
      setError("")
      setLoading(true)

      // Upload documents to Firebase Storage
      const documentUrls = {}
      
      if (documents.gramaNiladhariRecommendation) {
        const path = `applications/${currentUser.uid}/grama-niladhari-${Date.now()}`
        documentUrls.gramaNiladhariRecommendationUrl = await uploadFileToFirebase(documents.gramaNiladhariRecommendation, path)
      }
      
      if (documents.physicalEducationRecommendation) {
        const path = `applications/${currentUser.uid}/physical-education-${Date.now()}`
        documentUrls.physicalEducationRecommendationUrl = await uploadFileToFirebase(documents.physicalEducationRecommendation, path)
      }
      
      if (documents.additionalDocuments.length > 0) {
        const additionalUrls = []
        for (let i = 0; i < documents.additionalDocuments.length; i++) {
          const file = documents.additionalDocuments[i]
          const path = `applications/${currentUser.uid}/additional-${i}-${Date.now()}`
          const url = await uploadFileToFirebase(file, path)
          additionalUrls.push({
            name: file.name,
            url: url
          })
        }
        documentUrls.additionalDocumentsUrls = additionalUrls
      }

      // Submit application with form data and document URLs
      await addDoc(collection(db, "applications"), {
        ...formData,
        ...documentUrls,
        specialReasons,
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

  const goBackToStep1 = () => {
    setCurrentStep(1)
    setError("")
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
                Thank you for your application and uploaded documents. We will review them and get back to you soon.
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Application for Hostel Facilities</h2>
                <p className="text-white/80 text-sm mt-1">Faculty of Engineering - University of Ruhuna</p>
              </div>
              <div className="text-white/80 text-sm">
                Step {currentStep} of 2
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-white' : 'text-white/50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-white text-[#4a2d5f]' : 'bg-white/20'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm">Application Details</span>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-white' : 'bg-white/20'}`}></div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-white' : 'text-white/50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-white text-[#4a2d5f]' : 'bg-white/20'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm">Documents</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStepSubmit} className="space-y-6">
              {currentStep === 1 ? (
                <>
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Year of Applying</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="yearOfApplying" value="first" checked={formData.yearOfApplying === "first"} onChange={handleChange} className="mr-2" />
                        First
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="yearOfApplying" value="final" checked={formData.yearOfApplying === "final"} onChange={handleChange} className="mr-2" />
                        Final
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Degree</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="degreeType" value="general" checked={formData.degreeType === "general"} onChange={handleChange} className="mr-2" />
                        General
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="degreeType" value="special" checked={formData.degreeType === "special"} onChange={handleChange} className="mr-2" />
                        Special
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="faculty" className="form-label">Faculty</label>
                    <input id="faculty" name="faculty" type="text" value={formData.faculty} onChange={handleChange} required className="form-input bg-gray-100" readOnly />
                  </div>

                  <div>
                    <label htmlFor="registrationNumber" className="form-label">Student Registration Number</label>
                    <input id="registrationNumber" name="registrationNumber" type="text" value={formData.registrationNumber} onChange={handleChange} required className="form-input" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="fullName" className="form-label">Name in full</label>
                    <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="nameWithInitials" className="form-label">Name with initials</label>
                    <input id="nameWithInitials" name="nameWithInitials" type="text" value={formData.nameWithInitials} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                    <input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} required className="form-input" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="permanentAddress" className="form-label">Permanent address</label>
                    <textarea id="permanentAddress" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} required className="form-input" rows="3"></textarea>
                  </div>

                  <div>
                    <label className="form-label">Gender</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} className="mr-2" />
                        Male
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} className="mr-2" />
                        Female
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Marital Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="maritalStatus" value="single" checked={formData.maritalStatus === "single"} onChange={handleChange} className="mr-2" />
                        Single
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="maritalStatus" value="married" checked={formData.maritalStatus === "married"} onChange={handleChange} className="mr-2" />
                        Married
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Residence Details */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Details of Permanent Residence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="district" className="form-label">District</label>
                    <input id="district" name="district" type="text" value={formData.district} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="closestTown" className="form-label">Closest town to your residence</label>
                    <input id="closestTown" name="closestTown" type="text" value={formData.closestTown} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="distanceToTown" className="form-label">Distance from residence to closest town (km)</label>
                    <input id="distanceToTown" name="distanceToTown" type="number" step="0.1" value={formData.distanceToTown} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="distanceToFaculty" className="form-label">Distance from residence to Faculty of Engineering (km)</label>
                    <input id="distanceToFaculty" name="distanceToFaculty" type="number" step="0.1" value={formData.distanceToFaculty} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="walkingDistanceToBusStop" className="form-label">Walking distance from bus stop to residence (km)</label>
                    <input id="walkingDistanceToBusStop" name="walkingDistanceToBusStop" type="number" step="0.1" value={formData.walkingDistanceToBusStop} onChange={handleChange} required className="form-input" />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Degree</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="academicDegreeType" value="general" checked={formData.academicDegreeType === "general"} onChange={handleChange} className="mr-2" />
                        General
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="academicDegreeType" value="special" checked={formData.academicDegreeType === "special"} onChange={handleChange} className="mr-2" />
                        Special
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="department" className="form-label">Department</label>
                    <select id="department" name="department" value={formData.department} onChange={handleChange} required className="form-input">
                      <option value="">Select Department</option>
                      <option value="Civil and Environmental Engineering">Civil and Environmental Engineering</option>
                      <option value="Electrical and Information Engineering">Electrical and Information Engineering</option>
                      <option value="Mechanical and Manufacturing Engineering">Mechanical and Manufacturing Engineering</option>
                      <option value="Marine Engineering and Naval Architecture">Marine Engineering and Naval Architecture</option>
                      <option value="Computer Engineering">Computer Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="presentLevel" className="form-label">Present level / year</label>
                    <select id="presentLevel" name="presentLevel" value={formData.presentLevel} onChange={handleChange} required className="form-input">
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Have you been punished/warned for any misconduct/misbehavior?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="hasMisconduct" value="yes" checked={formData.hasMisconduct === "yes"} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="hasMisconduct" value="no" checked={formData.hasMisconduct === "no"} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="form-label">Are you a recipient of a Mahapola / Bursary / Any other student grant?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="receivesGrant" value="yes" checked={formData.receivesGrant === "yes"} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="receivesGrant" value="no" checked={formData.receivesGrant === "no"} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>

                  {formData.receivesGrant === "yes" && (
                    <div>
                      <label htmlFor="grantAmount" className="form-label">Grant amount per month (Rs.)</label>
                      <input id="grantAmount" name="grantAmount" type="number" value={formData.grantAmount} onChange={handleChange} className="form-input" />
                    </div>
                  )}
                </div>
              </div>

              {/* Family Details - Siblings */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Details of brothers and sisters who are students at present</h3>
                {formData.siblings.map((sibling, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-white rounded border">
                    <div>
                      <label className="form-label">Name of brother/sister</label>
                      <input
                        type="text"
                        value={sibling.name}
                        onChange={(e) => handleSiblingChange(index, 'name', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">School or University</label>
                      <input
                        type="text"
                        value={sibling.schoolUniversity}
                        onChange={(e) => handleSiblingChange(index, 'schoolUniversity', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="form-label">Present grade/academic year</label>
                        <input
                          type="text"
                          value={sibling.gradeYear}
                          onChange={(e) => handleSiblingChange(index, 'gradeYear', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      {formData.siblings.length > 1 && (
                        <button type="button" onClick={() => removeSibling(index)} className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addSibling} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" /> Add Sibling
                </button>
              </div>

              {/* Family Income */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Family Income</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fatherIncome" className="form-label">Father's gross monthly income (Rs.)</label>
                    <input id="fatherIncome" name="fatherIncome" type="number" value={formData.fatherIncome} onChange={handleChange} className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="motherIncome" className="form-label">Mother's gross monthly income (Rs.)</label>
                    <input id="motherIncome" name="motherIncome" type="number" value={formData.motherIncome} onChange={handleChange} className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="guardianIncome" className="form-label">Guardian's gross monthly income (Rs.)</label>
                    <input id="guardianIncome" name="guardianIncome" type="number" value={formData.guardianIncome} onChange={handleChange} className="form-input" />
                  </div>

                  <div>
                    <label className="form-label">Whether parents are recipients of Samurdhi / any other grant</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="receivesSamurdhi" value="yes" checked={formData.receivesSamurdhi === "yes"} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="receivesSamurdhi" value="no" checked={formData.receivesSamurdhi === "no"} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fatherOccupation" className="form-label">Father's Occupation</label>
                    <input id="fatherOccupation" name="fatherOccupation" type="text" value={formData.fatherOccupation} onChange={handleChange} className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="motherOccupation" className="form-label">Mother's Occupation</label>
                    <input id="motherOccupation" name="motherOccupation" type="text" value={formData.motherOccupation} onChange={handleChange} className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="guardianOccupation" className="form-label">Guardian's Occupation</label>
                    <input id="guardianOccupation" name="guardianOccupation" type="text" value={formData.guardianOccupation} onChange={handleChange} className="form-input" />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Certified copies of salary slips, Samurdhi card, or Grama Niladhari certificate must be attached.
                    If parents are deceased, certified copy of death certificate to be attached.
                  </p>
                </div>
              </div>

              {/* Previous Hostel Experience */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Previous Hostel Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="form-label">Have you received hostel facilities in previous years? (not applicable for first year students)</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="receivedHostelBefore" value="yes" checked={formData.receivedHostelBefore === "yes"} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="receivedHostelBefore" value="no" checked={formData.receivedHostelBefore === "no"} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>

                  {formData.receivedHostelBefore === "yes" && (
                    <div>
                      <label htmlFor="previousHostelYears" className="form-label">Relevant year/s</label>
                      <input id="previousHostelYears" name="previousHostelYears" type="text" value={formData.previousHostelYears} onChange={handleChange} className="form-input" placeholder="e.g., 2022, 2023" />
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="emergencyContactName" className="form-label">Name and address of person to be informed in case of an emergency</label>
                    <input id="emergencyContactName" name="emergencyContactName" type="text" value={formData.emergencyContactName} onChange={handleChange} required className="form-input" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="emergencyContactAddress" className="form-label">Address</label>
                    <textarea id="emergencyContactAddress" name="emergencyContactAddress" value={formData.emergencyContactAddress} onChange={handleChange} required className="form-input" rows="3"></textarea>
                  </div>

                  <div>
                    <label htmlFor="emergencyContactPhone" className="form-label">Telephone Number</label>
                    <input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} required className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="emergencyContactRelation" className="form-label">Relationship to you</label>
                    <input id="emergencyContactRelation" name="emergencyContactRelation" type="text" value={formData.emergencyContactRelation} onChange={handleChange} required className="form-input" />
                  </div>
                </div>
              </div>

              {/* Sports Activities */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Sports Activities (if applicable)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="universityTeam" className="form-label">University team of which you are a member and academic year</label>
                    <input id="universityTeam" name="universityTeam" type="text" value={formData.universityTeam} onChange={handleChange} className="form-input" placeholder="e.g., Cricket Team - 2023" />
                  </div>

                  <div>
                    <label className="form-label">Have you received University colors?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="receivedColors" value="yes" checked={formData.receivedColors === "yes"} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="receivedColors" value="no" checked={formData.receivedColors === "no"} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please attach certificates as proof of sports achievements.
                  </p>
                </div>
              </div>

                {/* Navigation */}
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary flex items-center">
                    Continue to Documents <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
                </>
              ) : (
                <>
                {/* Step 2: Document Upload */}
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Required Documents</h3>
                    <p className="text-gray-600">Please upload the required documents to complete your application</p>
                  </div>

                  {/* Grama Niladhari Recommendation */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-green-600" />
                      15. Recommendation of the Grama Niladhari
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Required Certification:</strong> The Grama Niladhari must certify that:
                      </p>
                      <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>You have been a resident at the stated address according to the householder's list</li>
                        <li>Information about permanent residence and family income is true and correct</li>
                        <li>Document must include name, date, signature, telephone, Grama Seva Division, District Secretariat, and official seal</li>
                      </ul>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      {!documents.gramaNiladhariRecommendation ? (
                        <div className="text-center">
                          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <label htmlFor="grama-niladhari" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">Upload Grama Niladhari Recommendation</span>
                            <input 
                              id="grama-niladhari" 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload('gramaNiladhariRecommendation', e.target.files[0])}
                            />
                          </label>
                          <p className="text-gray-500 text-sm mt-1">PDF, JPG, JPEG, PNG (Max 10MB)</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium">{documents.gramaNiladhariRecommendation.name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeDocument('gramaNiladhariRecommendation')}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical Education Recommendation (Conditional) */}
                  {(formData.universityTeam || formData.receivedColors === 'yes') && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-orange-600" />
                        16. Recommendation of the Director of Physical Education Unit
                      </h4>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-orange-800 mb-2">
                          <strong>For students involved in sports activities (not applicable for first year students):</strong>
                        </p>
                        <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                          <li>Certification that you are a recipient of University colors</li>
                          <li>Confirmation of representing the University team in the academic year</li>
                          <li>Required to attend training sessions after 5:00 PM</li>
                          <li>Must include signature, date, and official seal</li>
                        </ul>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        {!documents.physicalEducationRecommendation ? (
                          <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <label htmlFor="physical-education" className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-700 font-medium">Upload Physical Education Recommendation</span>
                              <input 
                                id="physical-education" 
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleDocumentUpload('physicalEducationRecommendation', e.target.files[0])}
                              />
                            </label>
                            <p className="text-gray-500 text-sm mt-1">PDF, JPG, JPEG, PNG (Max 10MB)</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">{documents.physicalEducationRecommendation.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeDocument('physicalEducationRecommendation')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Documents */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      Additional Supporting Documents
                    </h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-purple-800 mb-2">
                        <strong>Upload supporting documents for:</strong>
                      </p>
                      <ul className="text-sm text-purple-700 list-disc list-inside space-y-1">
                        <li>Certified copies of salary slips, Samurdhi card, or Grama Niladhari certificate</li>
                        <li>Death certificates (if parents are deceased)</li>
                        <li>Sports achievement certificates</li>
                        <li>Any other documents supporting special circumstances</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      {documents.additionalDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-blue-800 font-medium">{doc.name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeDocument('additionalDocuments', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <label htmlFor="additional-docs" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">Add Additional Document</span>
                            <input 
                              id="additional-docs" 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload('additionalDocuments', e.target.files[0])}
                            />
                          </label>
                          <p className="text-gray-500 text-sm mt-1">PDF, JPG, JPEG, PNG (Max 10MB each)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Reasons */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-lg font-semibold mb-3">Special Reasons for Requesting Hostel Facilities</h4>
                    <textarea
                      value={specialReasons}
                      onChange={(e) => setSpecialReasons(e.target.value)}
                      placeholder="If there are any special reasons for requesting hostel facilities, please state them in order of priority. Documents in support of each reason should be uploaded above."
                      className="form-input w-full"
                      rows="4"
                    />
                  </div>

                  {/* Important Notes */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">Important Notes:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Applications must be submitted by hand or registered post before the due date</li>
                      <li>• Applications received after the due date will be considered only if vacancy exists</li>
                      <li>• Incomplete, not duly certified, or false information will result in rejection</li>
                      <li>• All documents must be properly certified and contain official seals where required</li>
                    </ul>
                  </div>

                  {/* Terms and Submit */}
                  <div className="flex items-center">
                    <input id="terms" type="checkbox" required className="h-4 w-4 text-[#4a2d5f] focus:ring-[#4a2d5f] border-gray-300 rounded" />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the terms and conditions and confirm that all information provided is accurate and all documents are genuine.
                    </label>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button type="button" onClick={goBackToStep1} className="flex items-center px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back to Application
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
