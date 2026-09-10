import React from "react"
import Link from "next/link"
import { Heart, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-pink-100 bg-white/80 backdrop-blur-md pt-12 pb-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                SAKHI
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Empowering women through personalized AI wellness, Ayurvedic wisdom, IoT health metrics, and confidential support.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private & HIPAA Compliant Data</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm tracking-wider uppercase">Features</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" className="hover:text-pink-600 transition-colors">Home Dashboard</a>
              </li>
              <li>
                <Link href="/clinical-reports" className="hover:text-pink-600 transition-colors">Clinical Report Parser</Link>
              </li>
              <li>
                <Link href="/anonymous-chat" className="hover:text-pink-600 transition-colors">Anonymous Sakhi Chat</Link>
              </li>
              <li>
                <Link href="/subscription" className="hover:text-pink-600 transition-colors">Wellness Plans</Link>
              </li>
            </ul>
          </div>

          {/* Health Support */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm tracking-wider uppercase">Health Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-700 font-medium">Ayurvedic Dosha Analysis</span>
              </li>
              <li>
                <span className="text-slate-700 font-medium">Cycle & Hormonal Tracking</span>
              </li>
              <li>
                <span className="text-slate-700 font-medium">Smart Vitals Sync</span>
              </li>
              <li>
                <span className="text-slate-700 font-medium">Nutrition & Herbal Guides</span>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 mb-2 text-sm tracking-wider uppercase">Emergency Support</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              SAKHI provides educational triage and is not an emergency medical service. If you need immediate care:
            </p>
            <div className="text-xs space-y-1.5 bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-900 font-medium">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>National Emergency: 112 / 911</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>Women Helpline: 1091</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-pink-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SAKHI Health Companion. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Confidential & Encrypted</span>
            <span>Made with Care for Women's Wellness</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
