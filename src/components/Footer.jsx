export default function Footer() {
  return (
    <footer className="bg-[#6B3FA0] border-t-4  ">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-start">
        {/* Logo and HMS */}
        <div className="flex items-center mb-2 md:mb-0 md:mr-8">
          <img
            src="/images/logo_copy.png"
            alt="Ruhuna Logo"
            className="w-25 h-20 mr-4"
          />
          <span className="text-4xl font-serif text-black">HMS</span>
        </div>
      </div>
      {/* Description */}
      <div className="container mx-auto mt-2 flex flex-col md:flex-row">
        <div className="flex-1">
          <p className="text-center font text-black text-lg leading-tight">
            The Faculty of Engineering of University of Ruhuna was established
            on <br />
            1st July 1999 at Hapugala, Galle. Admission to the Faculty of <br />
            Engineering, University of Ruhuna, is subject to the University
            Grants <br />
            Commission policy on university admissions.
          </p>
        </div>
        <div className="flex-1 flex flex-col items-end mt-4 md:mt-0">
          <div className="text-black text-base text-right">
            <div className="font-semibold mb-1">Contact us</div>
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
      </div>
    </footer>
  );
}
