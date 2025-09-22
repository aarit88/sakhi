"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Video, Search, Clock, User, Star, Download, ExternalLink, Bookmark, Filter } from "lucide-react"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Resources" },
    { id: "articles", name: "Articles" },
    { id: "videos", name: "Videos" },
    { id: "guides", name: "Guides" },
    { id: "research", name: "Research" },
  ]

  const resources = [
    {
      id: 1,
      title: "Understanding Your Menstrual Cycle: A Complete Guide",
      description: "Comprehensive overview of the four phases of menstruation and what to expect during each phase.",
      type: "article",
      category: "articles",
      author: "Dr. Sarah Johnson",
      readTime: "8 min read",
      rating: 4.8,
      tags: ["cycle", "education", "basics"],
      image: "/placeholder.svg?height=200&width=300&text=Menstrual+Cycle+Guide",
      featured: true,
    },
    {
      id: 2,
      title: "Ayurvedic Remedies for Menstrual Pain",
      description: "Traditional Indian approaches to managing period pain using herbs, diet, and lifestyle changes.",
      type: "article",
      category: "articles",
      author: "Dr. Priya Sharma",
      readTime: "12 min read",
      rating: 4.9,
      tags: ["ayurveda", "pain relief", "traditional"],
      image: "/placeholder.svg?height=200&width=300&text=Ayurvedic+Remedies",
      featured: true,
    },
    {
      id: 3,
      title: "Yoga for Menstrual Health",
      description: "Video series demonstrating specific yoga poses and sequences for different phases of your cycle.",
      type: "video",
      category: "videos",
      author: "Yoga with Meera",
      readTime: "25 min watch",
      rating: 4.7,
      tags: ["yoga", "exercise", "wellness"],
      image: "/placeholder.svg?height=200&width=300&text=Yoga+Video",
      featured: false,
    },
    {
      id: 4,
      title: "Nutrition During Menstruation: Western Perspective",
      description: "Evidence-based nutritional recommendations for managing PMS and menstrual symptoms.",
      type: "guide",
      category: "guides",
      author: "Nutritionist Lisa Chen",
      readTime: "15 min read",
      rating: 4.6,
      tags: ["nutrition", "western medicine", "diet"],
      image: "/placeholder.svg?height=200&width=300&text=Nutrition+Guide",
      featured: false,
    },
    {
      id: 5,
      title: "Hormonal Changes Throughout Your Cycle",
      description:
        "Scientific explanation of hormonal fluctuations and their effects on mood, energy, and physical symptoms.",
      type: "research",
      category: "research",
      author: "Dr. Emily Rodriguez",
      readTime: "20 min read",
      rating: 4.5,
      tags: ["hormones", "science", "research"],
      image: "/placeholder.svg?height=200&width=300&text=Hormonal+Research",
      featured: false,
    },
    {
      id: 6,
      title: "Heat Therapy: Ancient Wisdom Meets Modern Science",
      description: "How traditional heat treatments compare to modern heating devices for menstrual pain relief.",
      type: "article",
      category: "articles",
      author: "Dr. Raj Patel",
      readTime: "10 min read",
      rating: 4.8,
      tags: ["heat therapy", "pain relief", "traditional", "modern"],
      image: "/placeholder.svg?height=200&width=300&text=Heat+Therapy",
      featured: false,
    },
    {
      id: 7,
      title: "Meditation for Menstrual Wellness",
      description: "Guided meditation practices specifically designed for different phases of your menstrual cycle.",
      type: "video",
      category: "videos",
      author: "Mindful Moments",
      readTime: "30 min watch",
      rating: 4.9,
      tags: ["meditation", "mindfulness", "wellness"],
      image: "/placeholder.svg?height=200&width=300&text=Meditation+Video",
      featured: false,
    },
    {
      id: 8,
      title: "Essential Oils for Menstrual Support",
      description: "Complete guide to using aromatherapy and essential oils for menstrual symptom management.",
      type: "guide",
      category: "guides",
      author: "Aromatherapist Maya Singh",
      readTime: "12 min read",
      rating: 4.4,
      tags: ["aromatherapy", "essential oils", "natural remedies"],
      image: "/placeholder.svg?height=200&width=300&text=Essential+Oils",
      featured: false,
    },
  ]

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredResources = resources.filter((resource) => resource.featured)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Educational Resources</h1>
          <p className="text-muted-foreground">
            Comprehensive library of articles, videos, and guides combining traditional wisdom with modern science
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === "all" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={resource.image || "/placeholder.svg"}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">Featured</Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-background/80">
                        {resource.type}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{resource.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{resource.readTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{resource.rating}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button size="sm">Read More</Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "All Resources" : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <div className="text-sm text-muted-foreground">{filteredResources.length} resources found</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={resource.image || "/placeholder.svg"}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-background/80">
                      {resource.type}
                    </Badge>
                  </div>
                  {resource.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary/80 rounded-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">{resource.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{resource.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{resource.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{resource.rating}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{resource.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  <Button size="sm" className="w-full">
                    {resource.type === "video" ? "Watch Now" : "Read More"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resource Categories */}
        <div className="mt-16">
          <Tabs defaultValue="learning-paths" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
              <TabsTrigger value="quick-tips">Quick Tips</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
            </TabsList>

            <TabsContent value="learning-paths" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Beginner's Journey
                    </CardTitle>
                    <CardDescription>Start your menstrual health education from the basics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">5 modules • 2 hours</div>
                      <div className="text-sm text-muted-foreground">Perfect for newcomers</div>
                    </div>
                    <Button className="w-full">Start Learning</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-secondary" />
                      Traditional Wisdom
                    </CardTitle>
                    <CardDescription>Explore Ayurvedic and traditional approaches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">8 modules • 3 hours</div>
                      <div className="text-sm text-muted-foreground">Ancient practices explained</div>
                    </div>
                    <Button className="w-full">Start Learning</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-accent" />
                      Modern Science
                    </CardTitle>
                    <CardDescription>Evidence-based approaches and latest research</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">6 modules • 2.5 hours</div>
                      <div className="text-sm text-muted-foreground">Research-backed methods</div>
                    </div>
                    <Button className="w-full">Start Learning</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quick-tips" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Drink ginger tea for natural pain relief",
                  "Use heat therapy for 15-20 minutes at a time",
                  "Practice deep breathing during cramps",
                  "Stay hydrated with warm fluids",
                  "Gentle yoga can reduce tension",
                  "Magnesium supplements may help with cramps",
                ].map((tip, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Forum</CardTitle>
                  <CardDescription>Connect with other women and share experiences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Join our supportive community to share experiences and learn from others.
                    </p>
                    <Button>Join Community</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Cycle Tracking Template", type: "PDF", size: "2.1 MB" },
                  { name: "Yoga Pose Guide", type: "PDF", size: "5.3 MB" },
                  { name: "Nutrition Planner", type: "PDF", size: "1.8 MB" },
                  { name: "Symptom Diary", type: "PDF", size: "1.2 MB" },
                  { name: "Meditation Audio", type: "MP3", size: "12.5 MB" },
                  { name: "Recipe Collection", type: "PDF", size: "3.7 MB" },
                ].map((download, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{download.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {download.type} • {download.size}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
