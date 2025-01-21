import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8 text-white text-center">About Our Hostel Management System</h1>
      <div className="flex justify-center items-center ">
        <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-md">
          <p className="text-gray-700 mb-4">
            Welcome to our Hostel Management System. We are dedicated to providing efficient and user-friendly solutions for hostel administrators and residents alike.
          </p>
          <p className="text-gray-700 mb-4">
            Our system offers a range of features including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Easy room allocation and management</li>
            <li>Streamlined check-in and check-out processes</li>
            <li>Comprehensive billing and payment tracking</li>
            <li>Maintenance request handling</li>
            <li>Resident communication tools</li>
          </ul>
          <p className="text-gray-700">
            With our Hostel Management System, we aim to enhance the living experience for residents and simplify administrative tasks for hostel staff.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

