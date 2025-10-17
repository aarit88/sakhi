"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Thermometer, Droplets, Brain, ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-rose-50 to-peach-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-pink-100 rounded-full text-pink-700 text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" />
                Smart Women's Health Companion
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Meet{" "}
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 bg-clip-text text-transparent">
                  SAKHI
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Your intelligent IoT companion for personalized women's health tracking, smart device integration, and
                wellness insights powered by cutting-edge technology.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 text-lg"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-200 text-pink-600 hover:bg-pink-50 px-8 py-4 text-lg bg-transparent"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right Content - Device Preview */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {/* Smart Heat Pack */}
              <Card className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200 animate-float">
                <div className="flex items-center justify-between mb-4">
                  <Thermometer className="w-8 h-8 text-pink-600" />
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Heat Pack</h3>
                <p className="text-sm text-gray-600 mb-3">Gentle warmth therapy</p>
                <div className="text-2xl font-bold text-pink-600">38°C</div>
              </Card>

              {/* Smart Water Bottle */}
              <Card
                className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Droplets className="w-8 h-8 text-blue-600" />
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Bottle</h3>
                <p className="text-sm text-gray-600 mb-3">Hydration tracking</p>
                <div className="text-2xl font-bold text-blue-600">1.2L</div>
              </Card>

              {/* Mood Tracker */}
              <Card
                className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mood Light</h3>
                <p className="text-sm text-gray-600 mb-3">Emotional wellness</p>
                <div className="text-2xl font-bold text-purple-600">Calm</div>
              </Card>

              {/* Health Insights */}
              <Card
                className="p-6 bg-gradient-to-br from-orange-100 to-yellow-100 border-orange-200 animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8 text-orange-600" />
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Health Score</h3>
                <p className="text-sm text-gray-600 mb-3">Overall wellness</p>
                <div className="text-2xl font-bold text-orange-600">92%</div>
              </Card>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
            <div
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}
