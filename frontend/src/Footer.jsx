import React from 'react';

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Security", "Enterprise", "API Documentation"]
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Blog", "Press", "Contact"]
    },
    {
      title: "Resources",
      links: ["Help Center", "Community", "Tutorials", "Webinars", "Case Studies"]
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Compliance"]
    }
  ];

  return (
    <footer className="bg-black/90 text-white py-16 border-t border-blue-500/20 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">🚀 OfficePulse</h3>
            <p className="text-gray-400 mb-6">
              Transforming workplaces with intelligent automation and seamless hybrid work solutions.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <span className="text-xs font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <span className="text-xs font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <span className="text-xs font-bold">in</span>
              </div>
            </div>
          </div>

          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 OfficePulse. Atharva Lotankar (D15C - 27).
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Status
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Changelog
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;