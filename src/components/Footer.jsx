import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-[#4a2d5f] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Student Accommodation</h3>
            <p className="text-gray-300">Providing affordable and comfortable housing solutions for students.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-gray-300 hover:text-white">
                  Apply for Housing
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300">
              <p>Email: info@studenthousing.com</p>
              <p>Phone: +1 (123) 456-7890</p>
              <p>Address: 123 University Ave, College Town</p>
            </address>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Student Accommodation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
