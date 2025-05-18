"use client";

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowRight,
  Wifi,
  Coffee,
  ShowerHead,
  BookOpen,
  Users,
  Shield,
  Clock,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { currentUser } = useAuth();
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqs = [
    {
      question: "What is the application process for the hostel?",
      answer:
        "The application process is simple. Create an account, log in, and click on the 'Apply' button. Fill out the application form with your personal and academic details, and submit it. Our team will review your application and get back to you within 5-7 business days.",
    },
    {
      question: "Is there a fee for staying in the hostel?",
      answer:
        "Our hostels only charge a very small amount for one year. Essentially, the hostel is completely free for students, with only a minimal annual fee required.",
    },

    {
      question: "What security measures are in place?",
      answer:
        "With 24/7 on‑site security staff, our hostels provide a safe environment you can trust.",
    },
    {
      question: "Is there a curfew?",
      answer:
        "While we don't enforce a strict curfew, we do have quiet hours from 10 PM to 6 AM to ensure all residents can rest and study without disturbance.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative">
        <div className="h-[600px] relative overflow-hidden">
          <img
            src="/images/faculty.jpg"
            alt="Students at campus hostel"
            className="w-full h-full object-cover blur-sm"
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-[#ffffff] p-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hostel Management System

            </h1>
            <p className="text-xl md:text-2xl font-bold mb-8">
              Experience comfortable, affordable, and community-focused living
              designed specifically for students.
            </p>
            {currentUser ? (
              <Link
                to="/apply"
                className="bg-[#e91e63] hover:bg-[#d81b60] text-white font-bold py-3 px-8 rounded-md text-lg transition-colors inline-flex items-center"
              >
                Apply for Housing <ArrowRight className="ml-2" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-[#e91e63] hover:bg-[#d81b60] text-white font-bold py-3 px-8 rounded-md text-lg transition-colors inline-flex items-center"
              >
                Login to Apply <ArrowRight className="ml-2" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4a2d5f]">
              Welcome to Student Accommodation
            </h2>
            <p className="text-lg text-gray-700">
              Our mission is to provide students with a safe, comfortable, and
              enriching living environment that supports their academic success
              and personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#4a2d5f] rounded-full flex items-center justify-center mb-4">
                <Shield className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                24/7 security, controlled access, and emergency support ensure
                your safety is our top priority.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#e91e63] rounded-full flex items-center justify-center mb-4">
                <Users className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Living</h3>
              <p className="text-gray-600">
                Connect with fellow students, build lasting friendships, and
                enjoy community events and activities.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#4a2d5f] rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Study-Friendly</h3>
              <p className="text-gray-600">
                Dedicated study spaces, high-speed internet, and quiet hours to
                support your academic success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6 text-[#4a2d5f]">
                Modern Facilities for a Comfortable Student Life
              </h2>
              <p className="text-gray-700 mb-8">
                Our student accommodation is designed with your needs in mind.
                Enjoy a range of amenities that make your stay comfortable,
                convenient, and conducive to both studying and socializing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Coffee className="h-5 w-5 text-[#e91e63]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Common Area</h3>
                    <p className="text-sm text-gray-600">
                      Relax, study, charge your laptop at power points, and stay cool with ceiling fans in our comfortable common areas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <ShowerHead className="h-5 w-5 text-[#e91e63]" /> {/* Changed icon */}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Modern Washrooms</h3>
                    <p className="text-sm text-gray-600">
                      Our washrooms are kept clean and feature mirrors, sinks, and individual shower facilities for your comfort and privacy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Clock className="h-5 w-5 text-[#e91e63]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Access</h3>
                    <p className="text-sm text-gray-600">
                      Come and go as you please with secure 24/7 access.
                    </p>
                  </div>
                </div>
              </div>

              {currentUser ? (
                <Link
                  to="/apply"
                  className="btn-primary mt-8 inline-flex items-center"
                >
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="btn-primary mt-8 inline-flex items-center"
                >
                  Register to Apply
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>

            <div className="md:w-1/2 order-1 md:order-2">
              <div className="rounded-lg h-[400px] overflow-hidden">
                <img
                  src="/images/facilities.jpeg"
                  alt="Modern hostel facilities"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Types Section */}
      {/*
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4a2d5f]">
              Accommodation Options 
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Choose from a variety of room types designed to suit different
              preferences and budgets.
            </p>
          </div> 

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-64 overflow-hidden">
                <img
                  src="/images/single-room.jpg"
                  alt="Single room accommodation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Single Rooms</h3>
                <p className="text-gray-600 mb-4">
                  Private rooms with a bed, desk, chair, wardrobe, and access to
                  shared bathroom and kitchen facilities.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>All Locations</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-64 overflow-hidden">
                <img
                  src="/images/shared-room.jpg"
                  alt="Shared room accommodation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Shared Rooms</h3>
                <p className="text-gray-600 mb-4">
                  Economical option with 2-3 students per room, each with their
                  own bed, desk, and storage space.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Main Campus, Downtown</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-64 overflow-hidden">
                <img
                  src="/images/studio-apartment.jpg"
                  alt="Studio apartment accommodation"
                  className="w-full h-full object-cover"
                />
              </div> 
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Studio Apartments</h3>
                <p className="text-gray-600 mb-4">
                  Self-contained units with private bathroom and kitchenette,
                  offering more independence.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Premium Locations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Testimonials Section */}
      {/*
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4a2d5f]">
              What Our Residents Say
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Hear from students who have experienced living in our
              accommodation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="/images/student1.jpg"
                  alt="Sarah Johnson"
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">
                    Computer Science, Year 3
                  </p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700">
                "Living in the student hostel has been an amazing experience.
                The facilities are great, and I've made friends from all over
                the world. The staff is always helpful and responsive."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="/images/student2.jpg"
                  alt="Michael Chen"
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold">Michael Chen</h4>
                  <p className="text-sm text-gray-600">
                    Business Administration, Year 2
                  </p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700">
                "The location is perfect - close to campus and all amenities.
                The high-speed internet has been a lifesaver for online classes,
                and the common areas are great for group study sessions."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="/images/student3.jpg"
                  alt="Emma Rodriguez"
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold">Emma Rodriguez</h4>
                  <p className="text-sm text-gray-600">Psychology, Year 4</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(4)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
                <Star className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-gray-700">
                "I've lived here for three years now, and it feels like home.
                The community events are fun, and the quiet hours policy ensures
                I can study when needed. Highly recommend!"
              </p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4a2d5f]">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Find answers to common questions about our student accommodation.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full flex justify-between items-center p-4 text-left font-medium focus:outline-none"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{faq.question}</span>
                  {activeAccordion === index ? (
                    <ChevronUp className="h-5 w-5 text-[#4a2d5f]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#4a2d5f]" />
                  )}
                </button>
                <div
                  className={`px-4 pb-4 ${activeAccordion === index ? "block" : "hidden"
                    }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#4a2d5f] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Join Our Student ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Apply now to secure your spot in our student accommodation. Limited
            spaces available!
          </p>

          {currentUser ? (
            <Link
              to="/apply"
              className="bg-[#e91e63] hover:bg-[#d81b60] text-white font-bold py-3 px-8 rounded-md text-lg transition-colors"
            >
              Apply Now
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-white text-[#4a2d5f] hover:bg-gray-100 font-bold py-3 px-8 rounded-md text-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#4a2d5f] font-bold py-3 px-8 rounded-md text-lg transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="rounded-lg h-[400px] overflow-hidden">
              <a href="https://www.google.com/maps/search/faculty+of+engineering+university+of+ruhuna/@6.0796372,80.1909688,17.75z?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D" target="_blank">
                <img
                  src="/images/Hostel Locations.png"
                  alt="Map showing hostel locations"
                  className="w-full h-full object-cover"
                />
                </a>
              </div>
            </div>

            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-[#4a2d5f]">
                Conveniently Located
              </h2>
              <p className="text-gray-700 mb-6">
              Our hostels are right inside the campus, so lectures, libraries, and sports grounds are only minutes away. 
              Safe, convenient, and community focused - everything you need for an easier student life is on your doorstep. 
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#e91e63] mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Hostel A</h3>
                    <p className="text-gray-600">
                    Near Faculty cafeteria and Department of Electrical and Information engineering.
                    </p>
                    <p className="text-gray-600">
                      2 minutes walk to Departments Buildings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#e91e63] mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Hostel B</h3>
                    <p className="text-gray-600">
                      Near Faculty cafeteria and Department of Electrical and Information engineering.
                    </p>
                    <p className="text-gray-600">
                    2 minutes walk to Departments Buildings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#e91e63] mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Hostel C</h3>
                    <p className="text-gray-600">Near Faculty cafeteria and Department of Electrical and Information engineering.</p>
                    <p className="text-gray-600">
                    2 minutes walk to Departments Buildings.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#e91e63] mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Hostel D</h3>
                    <p className="text-gray-600">
                    Near Faculty Quarters, Play ground and Gymnasium.
                    </p>
                    <p className="text-gray-600">
                    10 minutes walk to Departments Buildings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
