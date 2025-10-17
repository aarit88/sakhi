"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <Card className="bg-gradient-to-r from-pink-500 to-rose-500 border-0 mb-16 animate-slide-up">
          <div className="p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Stay Connected with SAKHI</h3>
            <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
              Get personalized health insights, device updates, and wellness tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-white/20 border-white/30 text-white placeholder:text-pink-100"
              />
              <Button className="bg-white text-pink-600 hover:bg-pink-50">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 animate-slide-up">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                SAKHI
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering women's health through intelligent IoT technology and personalized wellness insights.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400">
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#dashboard" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#devices" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Smart Devices
                </a>
              </li>
              <li>
                <a href="#health" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Health Tracking
                </a>
              </li>
              <li>
                <a href="#insights" className="text-gray-300 hover:text-pink-400 transition-colors">
                  AI Insights
                </a>
              </li>
              <li>
                <a href="#analytics" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h4 className="text-lg font-semibold text-white mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Device Setup
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-pink-400" />
                <span className="text-gray-300">hello@sakhi.health</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-pink-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-pink-400" />
                <span className="text-gray-300">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 SAKHI. All rights reserved. Made with ❤️ for women's health.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-pink-400 text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-pink-400 text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-pink-400 text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
