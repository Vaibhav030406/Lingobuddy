import React from "react";
import { Link } from "react-router-dom";
import "./HeroPage.css";
import Threads from "../components/Threads";

const HeroPage = () => {
  return (
    <>
  {/* Fixed Background Animation */}
  <div 
    className="threads-background"
  >
    <Threads
      amplitude={0.5}
      distance={0}
      enableMouseInteraction={true}
       color={[1,1,1]} 
    />
  </div>

  {/* Scrollable Content */}
  <div className="hero-page" style={{ position: 'relative', zIndex: 1 }}>

        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-black/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                  <span className="text-2xl font-bold text-white">LingoBuddy</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-white hover:text-blue-400">Login</Link>
                <Link to="/signup" className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-500">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8  bg-black/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Where Language Meets Friendship
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Practice speaking, connect with people worldwide, and make learning fun.
              </p>
              <Link to="/signup" className="inline-block bg-white text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-500 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-black/50">
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