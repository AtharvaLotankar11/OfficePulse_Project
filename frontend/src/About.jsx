import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return isVisible;
};

// About Page Feature Component
const AboutFeature = ({ image, title, description, isReversed, delay }) => {
  const isVisible = useFadeIn(delay);
  
  return (
    <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 mb-20 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="flex-1">
        <img
          src={image}
          alt={title}
          className="w-full h-80 object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-3xl font-bold text-white mb-6">{title}</h3>
        <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const About = ({ currentPage, setCurrentPage }) => {
  const features = [
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Smart Space Management",
      description: "Our AI-driven platform analyzes usage patterns to optimize office layouts and resource allocation. Real-time occupancy tracking ensures efficient space utilization while maintaining social distancing protocols and comfort levels."
    },
    {
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Seamless Team Collaboration",
      description: "Connect hybrid teams with intuitive scheduling tools, instant messaging, and virtual meeting integration. Our platform bridges the gap between remote and in-office workers, fostering collaboration regardless of location."
    },
    {
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Advanced Analytics Dashboard",
      description: "Gain deep insights into workplace trends with comprehensive analytics. Track productivity metrics, space utilization, and employee satisfaction to make data-driven decisions that enhance your workplace strategy."
    },
    {
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Enterprise Security",
      description: "Built with security-first architecture featuring end-to-end encryption, multi-factor authentication, and comprehensive audit logging. Meet compliance requirements while ensuring your data remains protected at all times."
    },
    {
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Mobile-First Experience",
      description: "Access all features on-the-go with our responsive mobile application. Book desks, check in to meetings, and stay connected with your team from anywhere, ensuring productivity never stops."
    }
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About OfficePulse
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Revolutionizing the modern workplace with intelligent automation, 
              seamless integration, and data-driven insights for the hybrid work era.
            </p>
          </div>
          
          {features.map((feature, index) => (
            <AboutFeature
              key={index}
              image={feature.image}
              title={feature.title}
              description={feature.description}
              isReversed={index % 2 === 1}
              delay={index * 300}
            />
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;