import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import hostelImage from "../assets/hms-logo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#004D40] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-7xl mx-auto relative flex flex-col lg:flex-row justify-between items-center">
        <motion.div
          className="max-w-2xl mb-8 lg:mb-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl lg:text-6xl font-bold mb-4 text-center lg:text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-white">Hostel </span>
            <span className="text-blue-500">Management </span>
            <span className="text-white">System</span>
          </motion.h1>

          <motion.p
            className="text-white text-xl mb-12 text-center lg:text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Faculty of Engineering University of Ruhuna
          </motion.p>

          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                to="/login"
                className="bg-[#00F2F2] text-[#004D40] px-20 py-3 rounded-full text-xl font-medium
                hover:bg-opacity-90 transition-colors duration-300 inline-block"
              >
                Login
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-white text-sm"
            >
              OR
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <Link
                to="/register"
                className="text-[#00F2F2] hover:text-opacity-80 transition-colors duration-300 text-lg"
              >
                Create Account
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="flex-shrink-0 mt-8 lg:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <motion.img
            src={hostelImage}
            alt="Hostel Building"
            className="w-64 lg:w-80 h-auto"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
    </div>
  );
}
