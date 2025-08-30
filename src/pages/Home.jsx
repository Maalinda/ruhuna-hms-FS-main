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
  CheckCircle2,
  GraduationCap,
  Building,
  Leaf,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Home() {
  const { currentUser } = useAuth();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState({
    welcome: false,
    features: false,
    faq: false,
    cta: false,
    location: false
  });

  const sectionRefs = {
    welcome: useRef(null),
    features: useRef(null),
    faq: useRef(null),
    cta: useRef(null),
    location: useRef(null)
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Get the id from the element
            const id = entry.target.id;
            setIsVisible(prev => ({
              ...prev,
              [id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all section refs
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  useEffect(() => {
    async function checkApplicationStatus() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "applications"),
          where("userId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        setHasApplied(!querySnapshot.empty);
      } catch (error) {
        console.error("Error checking application status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkApplicationStatus();
  }, [currentUser]);

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
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/faculty.jpg"
            alt="Students at campus hostel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/80 to-[#4a2d5f]/70" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-white">
                Hostel Management
              </span>
              <br /> System
            </h1>

            <p className="text-xl md:text-2xl text-white font-bold mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg bg-black/30 rounded-xl px-4 py-3 inline-block">
              Experience comfortable, affordable, and community-focused living
              <br />
              designed specifically for engineering students.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              {loading ? (
                <div className="inline-flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : currentUser ? (
                hasApplied ? (
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white font-bold py-4 px-8 rounded-full text-lg transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center"
                  >
                    My Dashboard <ArrowRight className="ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/apply"
                      className="bg-gradient-to-r from-[#e91e63] to-[#f05d78] text-white font-bold py-4 px-8 rounded-full text-lg transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center"
                    >
                      Apply Now <ArrowRight className="ml-2" />
                    </Link>
                    <Link
                      to="/dashboard"
                      className="bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white font-bold py-4 px-8 rounded-full text-lg transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center"
                    >
                      My Dashboard <ArrowRight className="ml-2" />
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-[#e91e63] to-[#f05d78] text-white font-bold py-4 px-8 rounded-full text-lg transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center"
                  >
                    Login to Apply <ArrowRight className="ml-2" />
                  </Link>
                  <Link
                    to="/register"
                    className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-8 rounded-full text-lg transition-all hover:shadow-lg flex items-center justify-center"
                  >
                    Register Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8">
          <div className="animate-bounce">
            <ArrowRight size={30} className="text-white rotate-90" />
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section
        id="welcome"
        ref={sectionRefs.welcome}
        className="py-20 bg-white"
      >
        <div
          className={`container mx-auto px-4 transition-all duration-1000 ${
            isVisible.welcome
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#4a2d5f]">
              Welcome to Student Accommodation
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 leading-relaxed">
              Our mission is to provide students with a safe, comfortable, and
              enriching living environment that supports their academic success
              and personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-[#4a2d5f]">
              <div className="w-16 h-16 bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="text-white h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">
                Safe & Secure
              </h3>
              <p className="text-gray-600 text-center">
                24/7 security, controlled access, and emergency support ensure
                your safety is our top priority.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-[#e91e63]">
              <div className="w-16 h-16 bg-gradient-to-r from-[#e91e63] to-[#f05d78] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="text-white h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">
                Community Living
              </h3>
              <p className="text-gray-600 text-center">
                Connect with fellow students, build lasting friendships, and
                enjoy community events and activities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-[#4a2d5f]">
              <div className="w-16 h-16 bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] rounded-full flex items-center justify-center mb-6 mx-auto">
                <BookOpen className="text-white h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">
                Study-Friendly
              </h3>
              <p className="text-gray-600 text-center">
                Enjoy dedicated study areas, fast and reliable internet, 
                and quiet hours — all designed to help you excel academically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={sectionRefs.features}
        className="py-20 bg-gray-50"
      >
        <div
          className={`container mx-auto px-4 transition-all duration-1000 ${
            isVisible.features
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="mb-10">
                <h2 className="text-4xl font-bold mb-6 text-[#4a2d5f]">
                  Modern Facilities for a
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a2d5f] to-[#e91e63]">
                    {" "}
                    Comfortable{" "}
                  </span>
                  Student Life
                </h2>
                <div className="w-24 h-1 bg-yellow-400 mb-6"></div>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed text-justify">
                  Our student accommodation is designed with your needs in mind.
                  Enjoy a range of amenities that make your stay comfortable,
                  convenient, and conducive to both studying and socializing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start">
                  <div className="p-3 bg-[#e91e63]/10 rounded-lg mr-4">
                    <Coffee className="h-6 w-6 text-[#e91e63]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Common Area</h3>
                    <p className="text-gray-600 text-justify">
                      Relax, study, charge your laptop at power points, and stay
                      cool with ceiling fans in our comfortable common areas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-3 bg-[#4a2d5f]/10 rounded-lg mr-4">
                    <ShowerHead className="h-6 w-6 text-[#4a2d5f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Modern Washrooms</h3>
                    <p className="text-gray-600 text-justify">
                      Our washrooms are kept clean and feature mirrors, sinks,
                      and individual shower facilities for your comfort.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-3 bg-[#e91e63]/10 rounded-lg mr-4">
                    <Wifi className="h-6 w-6 text-[#e91e63]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">High-Speed WiFi</h3>
                    <p className="text-gray-600 text-justify">
                      Stay connected with reliable, high-speed internet
                      throughout the hostel.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-3 bg-[#4a2d5f]/10 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-[#4a2d5f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">24/7 Access</h3>
                    <p className="text-gray-600 text-justify">
                      Come and go as you please with secure 24/7 access to the
                      facilities.
                    </p>
                  </div>
                </div>
              </div>

              {currentUser ? (
                hasApplied ? (
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:shadow-lg hover:scale-105 inline-flex items-center mt-10"
                  >
                    View My Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    to="/apply"
                    className="bg-gradient-to-r from-[#e91e63] to-[#f05d78] text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:shadow-lg hover:scale-105 inline-flex items-center mt-10"
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )
              ) : (
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:shadow-lg hover:scale-105 inline-flex items-center mt-10"
                >
                  Register to Apply
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>

            <div className="lg:w-1/2 order-1 lg:order-2">
              <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500">
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

      {/* Stats Section (NEW) */}
      <section className="py-16 bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="w-12 h-1 bg-yellow-400 mx-auto mb-4"></div>
              <p className="text-lg">Students Housed</p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4</div>
              <div className="w-12 h-1 bg-yellow-400 mx-auto mb-4"></div>
              <p className="text-lg">Hostel Buildings</p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="w-12 h-1 bg-yellow-400 mx-auto mb-4"></div>
              <p className="text-lg">Security & Support</p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold mb-2">99%</div>
              <div className="w-12 h-1 bg-yellow-400 mx-auto mb-4"></div>
              <p className="text-lg">Student Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section (NEW) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-[#4a2d5f]">
              Why Choose Our Hostels?
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              We provide more than just a place to stay - we offer a complete
              student living experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl hover:shadow-lg transition-all border border-gray-100">
              <div className="rounded-full w-14 h-14 bg-[#e91e63]/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-7 w-7 text-[#e91e63]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Academic Focus</h3>
              <p className="text-gray-600 text-justify">
                Designed with your studies in mind, with quiet environments and
                study-friendly spaces.
              </p>
            </div>

            <div className="p-6 rounded-xl hover:shadow-lg transition-all border border-gray-100">
              <div className="rounded-full w-14 h-14 bg-[#4a2d5f]/10 flex items-center justify-center mb-4">
                <Building className="h-7 w-7 text-[#4a2d5f]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Campus Proximity</h3>
              <p className="text-gray-600 text-justify">
                Located right on campus, putting you minutes away from classes,
                libraries, and facilities.
              </p>
            </div>

            <div className="p-6 rounded-xl hover:shadow-lg transition-all border border-gray-100">
              <div className="rounded-full w-14 h-14 bg-[#e91e63]/10 flex items-center justify-center mb-4">
                <Leaf className="h-7 w-7 text-[#e91e63]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainable Living</h3>
              <p className="text-gray-600 text-justify">
                Environmentally conscious facilities with energy-efficient
                design and waste management.
              </p>
            </div>

            <div className="p-6 rounded-xl hover:shadow-lg transition-all border border-gray-100">
              <div className="rounded-full w-14 h-14 bg-[#4a2d5f]/10 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-[#4a2d5f]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inclusive Community</h3>
              <p className="text-gray-600 text-justify">
                A diverse environment where students from all backgrounds feel
                welcome and supported.
              </p>
            </div>

            <div className="p-6 rounded-xl hover:shadow-lg transition-all border border-gray-100">
              <div className="rounded-full w-14 h-14 bg-[#e91e63]/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-[#e91e63]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Affordable Living</h3>
              <p className="text-gray-600 text-justify">
                Accommodation is free for students. Only a small annual fee
                (about Rs. 1000) is charged for the student welfare fund.
              </p>
            </div>

            <div className="p-6 rounded-xl hover:shadow-lg transition-all border border-gray-100">
              <div className="rounded-full w-14 h-14 bg-[#4a2d5f]/10 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-[#4a2d5f]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Peace of Mind</h3>
              <p className="text-gray-600 text-justify">
                Professional management, maintenance, and support teams
                available whenever you need assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" ref={sectionRefs.faq} className="py-20 bg-gray-50">
        <div
          className={`container mx-auto px-4 transition-all duration-1000 ${
            isVisible.faq
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-[#4a2d5f]">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Find answers to common questions about our student accommodation.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-5 overflow-hidden">
                <button
                  className={`w-full flex justify-between items-center p-5 text-left font-medium focus:outline-none rounded-xl transition-all ${
                    activeAccordion === index
                      ? "bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white shadow-md"
                      : "bg-white hover:bg-gray-50 shadow-sm"
                  }`}
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="text-lg">{faq.question}</span>
                  {activeAccordion === index ? (
                    <ChevronUp
                      className={`h-5 w-5 ${
                        activeAccordion === index
                          ? "text-white"
                          : "text-[#4a2d5f]"
                      }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`h-5 w-5 ${
                        activeAccordion === index
                          ? "text-white"
                          : "text-[#4a2d5f]"
                      }`}
                    />
                  )}
                </button>
                <div
                  className={`bg-white px-5 rounded-b-xl shadow-sm transition-all duration-300 ${
                    activeAccordion === index
                      ? "max-h-96 py-5 opacity-100"
                      : "max-h-0 py-0 opacity-0"
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
      <section
        id="cta"
        ref={sectionRefs.cta}
        className="py-20 bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <img
            src="/images/hero.jpg"
            alt="Background pattern"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className={`container mx-auto px-4 text-center relative z-10 transition-all duration-1000 ${
            isVisible.cta
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join Our Student Community?
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6"></div>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Apply now to secure your spot in our student accommodation. Limited
            spaces available!
          </p>

          {currentUser ? (
            hasApplied ? (
              <Link
                to="/dashboard"
                className="bg-white hover:bg-gray-100 text-[#4a2d5f] font-bold py-4 px-10 rounded-full text-lg transition-all hover:shadow-lg transform hover:scale-105 inline-flex items-center"
              >
                View My Dashboard <ArrowRight className="ml-2" />
              </Link>
            ) : (
              <Link
                to="/apply"
                className="bg-gradient-to-r from-[#e91e63] to-[#f05d78] hover:shadow-lg text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center"
              >
                Apply Now <ArrowRight className="ml-2" />
              </Link>
            )
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="bg-white text-[#4a2d5f] hover:bg-gray-100 font-bold py-4 px-10 rounded-full text-lg transition-all hover:shadow-lg transform hover:scale-105 inline-flex items-center justify-center"
              >
                Login <ArrowRight className="ml-2" />
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-10 rounded-full text-lg transition-all hover:shadow-lg inline-flex items-center justify-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section
        id="location"
        ref={sectionRefs.location}
        className="py-20 bg-white"
      >
        <div
          className={`container mx-auto px-4 transition-all duration-1000 ${
            isVisible.location
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 h-[500px] w-full">
                {" "}
                {/* Increased height */}
                <a
                  href="https://www.google.com/maps/search/faculty+of+engineering+university+of+ruhuna/@6.0796372,80.1909688,17.75z?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src="/images/Hostel Locations.png"
                    alt="Map showing hostel locations"
                    className="w-full h-[600px] object-cover" // Increased height to 600px
                  />
                </a>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6 text-[#4a2d5f]">
                Conveniently Located
              </h2>
              <div className="w-24 h-1 bg-yellow-400 mb-6"></div>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed text-justify">
                Our hostels are right inside the campus, so lectures, libraries,
                and sports grounds are only minutes away. Safe, convenient, and
                community focused - everything you need for an easier student
                life is on your doorstep.
              </p>

              <div className="space-y-6">
                <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="p-3 bg-[#e91e63]/10 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-[#e91e63]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Hostel A (For Boys)
                    </h3>
                    <p className="text-gray-600">
                      Near Faculty cafeteria and Department of Electrical and
                      Information engineering.
                    </p>
                    <p className="text-gray-600">
                      2 minutes walk to Departments Buildings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="p-3 bg-[#4a2d5f]/10 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-[#4a2d5f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Hostel B (For Boys)
                    </h3>
                    <p className="text-gray-600">
                      Near Faculty cafeteria and Department of Electrical and
                      Information engineering.
                    </p>
                    <p className="text-gray-600">
                      2 minutes walk to Departments Buildings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="p-3 bg-[#e91e63]/10 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-[#e91e63]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Hostel C (For Girls)
                    </h3>
                    <p className="text-gray-600">
                      Near Faculty cafeteria and Department of Electrical and
                      Information engineering.
                    </p>
                    <p className="text-gray-600">
                      2 minutes walk to Departments Buildings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="p-3 bg-[#4a2d5f]/10 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-[#4a2d5f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Hostel D (For Boys)
                    </h3>
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
