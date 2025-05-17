export default function Footer() {
  return (
    <footer className="bg-[#c894e6] border-t-4 border-b-2 border-[#3b82f6] p-2">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-start">
        {/* Logo and HMS */}
        <div className="flex items-center mb-2 md:mb-0 md:mr-8">
          <img
            src="/images/logo_copy.png"
            alt="Ruhuna Logo"
            className="w-20 h-20 mr-4"
          />
          <span className="text-5xl font-serif text-black">HMS</span>
        </div>
        {/* Contact Info */}
        <div className="text-black text-base md:text-right">
          <div className="mb-1 mt-2 md:mt-0">Contact us</div>
          <div>Faculty of Engineering, Hapugala, Galle, Sri Lanka.</div>
          <div>
            Phone : + (94)0 91 2245765/6; Email:
            <a
              href="mailto:webmaster@eng.ruh.ac.lk"
              className="ml-1 underline text-black"
            >
              webmaster@eng.ruh.ac.lk
            </a>
          </div>
        </div>
      </div>
      {/* Description */}
      <div className="container mx-auto mt-2">
        <p className="text-center font-bold text-black text-lg leading-tight">
          The Faculty of Engineering of University of Ruhuna was established on{" "}
          <br />
          1st July 1999 at Hapugala, Galle. Admission to the Faculty of <br />
          Engineering, University of Ruhuna, is subject to the University Grants{" "}
          <br />
          Commission policy on university admissions.
        </p>
      </div>
    </footer>
  );
}
