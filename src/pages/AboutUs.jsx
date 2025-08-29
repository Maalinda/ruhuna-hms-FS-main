"use client"

function Card({ children }) {
  return <div className="bg-white shadow-lg rounded-2xl p-6">{children}</div>;
}

function CardContent({ children }) {
  return <div>{children}</div>;
}

import { Users, Building2, Target } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">About Us</h1>

      <div className="max-w-5xl space-y-8">
        {/* Intro */}
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              The <span className="font-semibold">Hostel Management System (HMS)</span> is a web-based platform designed to simplify and digitalize hostel administration tasks at the University of Ruhuna. Our system allows students and wardens to manage hostel-related activities such as registration, defect reporting and accessing virtual notice boards.
            </p>
          </CardContent>
        </Card>

        {/* Mission, Vision, Team */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg rounded-3xl">
            <CardContent className="p-6 text-center">
              <Target className="mx-auto mb-3 text-blue-600 w-10 h-10" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Our Mission</h2>
              <p className="text-gray-600 text-sm text-justify">
                To provide a reliable, user-friendly, and efficient platform 
                that improves hostel management and enhances student convenience.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl">
            <CardContent className="p-6 text-center">
              <Building2 className="mx-auto mb-3 text-green-600 w-10 h-10" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Our Vision</h2>
              <p className="text-gray-600 text-sm text-justify">
                To be the leading digital hostel management solution in Sri Lanka, 
                setting a standard for universities nationwide.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl">
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-3 text-purple-600 w-10 h-10" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Our Team</h2>
              <p className="text-gray-600 text-sm text-justify">
              Developed by engineering undergraduates from the University of Ruhuna's 
              Faculty of Engineering, driven by a mission to utilize technology 
              for meaningful problem-solving.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
