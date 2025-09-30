import React from "react";
import { Link } from "react-router-dom";
import "./HeroPage.css";
import GradientBlinds from "../components/GradientBlinds";

const HeroPage = () => {
  return (
    <>
      {/* Fixed Background Animation */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0 
      }}>
        <GradientBlinds
          gradientColors={['#FF9FFC', '#5227FF']}
          angle={0}
          noise={0.3}
          blindCount={12}
          blindMinWidth={50}
          spotlightRadius={0.5}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      {/* Scrollable Content */}
      <div className="hero-page" style={{ position: 'relative', zIndex: 1 }}>
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-black/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <span className="text-2xl font-bold text-white">LingoBuddy</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-white hover:text-blue-400">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Where Language Meets Friendship
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Practice speaking, connect with people worldwide, and make learning fun.
              </p>
              <Link to="/signup" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-black/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Choose LingoBuddy?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-4 text-white">Live Language Exchange</h3>
                <p className="text-gray-300">Connect with native speakers worldwide for real-time practice sessions</p>
              </div>
              <div className="p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-4 text-white">AI-Powered Learning</h3>
                <p className="text-gray-300">Get instant feedback on pronunciation and grammar from our AI assistant</p>
              </div>
              <div className="p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-4 text-white">Global Community</h3>
                <p className="text-gray-300">Join a vibrant community of language learners from around the world</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">LingoBuddy</h3>
                <p className="text-sm text-gray-400">Making language learning social and fun.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Features</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/features/exchange" className="hover:text-white">Language Exchange</Link></li>
                  <li><Link to="/features/ai" className="hover:text-white">AI Assistant</Link></li>
                  <li><Link to="/features/community" className="hover:text-white">Community</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                  <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} LingoBuddy. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HeroPage;