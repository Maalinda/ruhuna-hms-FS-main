import { Facebook, Mail, MapPin, Phone, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-[#4a2d5f] to-[#5d3a75] border-t-4 border-t-yellow-400 pt-8 pb-6 text-white">
      <div className="container mx-auto px-4">
        {/* Top Section with Logo and Info */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mb-8 gap-8">
          {/* Logo and Description */}
          <div className="max-w-md">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <img
                  src="/images/logo_copy.png"
                  alt="Ruhuna Logo"
                  className="w-20 h-auto mr-3"
                />
                <span className="text-4xl font-bold text-yellow-400">HMS</span>
              </div>
            </div>
            <p className="text-center lg:text-left text-white/90 leading-relaxed">
              The Faculty of Engineering of University of Ruhuna was established on 1st July 1999 at Hapugala, Galle. 
              Admission to the Faculty of Engineering, University of Ruhuna, is subject to the University Grants Commission 
              policy on university admissions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-center lg:text-left border-b border-yellow-400 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-yellow-400 transition-colors">Home</Link>
              </li>

              <li>
               <Link to="/aboutus" className="text-white/80 hover:text-yellow-400 transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-center lg:text-left border-b border-yellow-400 pb-2">Contact Us</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-yellow-400 flex-shrink-0" />
                <span>Faculty of Engineering, Hapugala, Galle, Sri Lanka.</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-yellow-400 flex-shrink-0" />
                <span>+ (94)0 91 2245765/6</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-yellow-400 flex-shrink-0" />
                <a href="mailto:webmaster@eng.ruh.ac.lk" className="hover:text-yellow-400 transition-colors">
                  webmaster@eng.ruh.ac.lk
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-white/20 my-6"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/70 mb-4 md:mb-0">
            © {currentYear} Faculty of Engineering, University of Ruhuna. All rights reserved.
          </p>
          
          {/* Social Media Links */}
          <div className="flex space-x-4">
            <a href="https://web.facebook.com/EfacUOR/?_rdc=1&_rdr" className="text-white/70 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-white/10">
              <Facebook size={20} />
            </a>
            <a href="https://www.linkedin.com/company/faculty-of-engineering-university-of-ruhuna/" className="text-white/70 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-white/10">
              <Linkedin size={20} />
            </a>
            <a href="https://www.youtube.com/@refmedia" className="text-white/70 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-white/10">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
