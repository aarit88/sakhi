import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, BookOpen, Activity, Thermometer, Droplets, Lightbulb } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Image src="/images/sakhi-logo.png" alt="SAKHI Logo" width={120} height={120} className="rounded-full" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Your Personal <span className="text-primary">Women's Health</span> Companion
            </h1>
            <p className="text-xl text-muted-foreground text-balance mb-8 max-w-3xl mx-auto">
              SAKHI combines traditional Indian wisdom with modern Western approaches to provide personalized solutions
              for menstrual health, wellness tracking, and holistic care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Your Journey</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/resources">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Health Solutions</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              From symptom tracking to IoT device integration, SAKHI provides everything you need for informed health
              decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Symptom Tracking</CardTitle>
                <CardDescription>
                  Log and monitor your symptoms with intelligent insights and pattern recognition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Daily symptom logging</li>
                  <li>• Pattern analysis</li>
                  <li>• Personalized insights</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Dual Approach Solutions</CardTitle>
                <CardDescription>
                  Access both traditional Indian remedies and modern Western treatments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Ayurvedic remedies</li>
                  <li>• Modern medical insights</li>
                  <li>• Ingredient analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Exercise & Wellness</CardTitle>
                <CardDescription>
                  Personalized yoga routines and exercises for pain relief and wellness.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Targeted yoga poses</li>
                  <li>• Pain relief exercises</li>
                  <li>• Wellness routines</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* IoT Integration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              IoT Integration
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Smart Devices for Better Health</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Connect with intelligent devices designed specifically for women's health and comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Thermometer className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Smart Heat Pack</CardTitle>
                <CardDescription>
                  Wearable heat therapy with app-controlled temperature and duration settings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>Smart Water Bottle</CardTitle>
                <CardDescription>
                  Hydration reminders with warming function for herbal teas and wellness drinks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Mood AURA Light</CardTitle>
                <CardDescription>
                  Ambient lighting that responds to your mood and provides calming color therapy.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Health Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of women who have already discovered the power of combining traditional wisdom with modern
            technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/resources">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image src="/images/sakhi-logo.png" alt="SAKHI Logo" width={32} height={32} className="rounded-full" />
              <span className="text-lg font-bold text-primary">SAKHI</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 SAKHI. Empowering women through traditional wisdom and modern healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
