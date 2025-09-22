"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Leaf, Stethoscope, Pill, Coffee, Droplets, Heart, Brain, Activity } from "lucide-react"

export default function TreatmentsPage() {
  const [selectedSymptom, setSelectedSymptom] = useState("abdominal-pain")

  const symptoms = [
    { id: "abdominal-pain", name: "Abdominal Pain", icon: Heart },
    { id: "mood-swings", name: "Mood Swings", icon: Brain },
    { id: "body-pain", name: "Body Pain", icon: Activity },
  ]

  const treatments = {
    "abdominal-pain": {
      western: {
        title: "Western Approach",
        description: "Commonly linked to prostaglandin imbalance. Focus on anti-inflammatory relief.",
        ingredients: [
          {
            name: "Magnesium",
            description: "Muscle relaxation, reduces anti-inflammatory pain relief.",
            dosage: "200-400mg daily",
            benefits: ["Reduces muscle cramps", "Improves sleep quality", "Decreases inflammation"],
          },
          {
            name: "Ibuprofen (NSAIDs)",
            description: "Non-steroidal anti-inflammatory drug that blocks prostaglandin production.",
            dosage: "200-400mg every 6-8 hours",
            benefits: ["Reduces inflammation", "Pain relief", "Decreases menstrual flow"],
          },
        ],
        remedies: [
          "Apply heat therapy (heating pad) for 15-20 minutes",
          "Take warm baths with Epsom salt",
          "Stay hydrated with electrolyte-rich fluids",
          "Consider dietary changes to reduce inflammation",
        ],
      },
      indian: {
        title: "Indian Approach (Ayurvedic)",
        description: "Based on balancing Vata dosha and improving digestive fire (Agni).",
        ingredients: [
          {
            name: "Ginger (Adrak)",
            description: "Natural anti-inflammatory and digestive aid that reduces prostaglandin levels.",
            dosage: "1-2 tsp fresh ginger tea, 2-3 times daily",
            benefits: ["Reduces nausea", "Anti-inflammatory", "Improves digestion"],
          },
          {
            name: "Turmeric (Haldi)",
            description: "Contains curcumin which has powerful anti-inflammatory properties.",
            dosage: "1 tsp with warm milk before bed",
            benefits: ["Reduces inflammation", "Natural pain relief", "Antioxidant properties"],
          },
          {
            name: "Fenugreek Seeds (Methi)",
            description: "Rich in compounds that help regulate hormones and reduce cramping.",
            dosage: "Soak overnight, drink water in morning",
            benefits: ["Hormone regulation", "Reduces cramping", "Improves digestion"],
          },
        ],
        remedies: [
          "Drink warm ginger-jaggery tea throughout the day",
          "Apply warm sesame oil massage on lower abdomen",
          "Practice Pawanmuktasana (wind-relieving pose)",
          "Consume warm, cooked foods and avoid cold items",
        ],
      },
    },
    "mood-swings": {
      western: {
        title: "Western Approach",
        description: "Linked to hormonal fluctuations affecting neurotransmitters like serotonin.",
        ingredients: [
          {
            name: "Vitamin B6",
            description: "Helps in serotonin production and hormone regulation.",
            dosage: "50-100mg daily",
            benefits: ["Improves mood", "Reduces PMS symptoms", "Supports neurotransmitter function"],
          },
          {
            name: "Omega-3 Fatty Acids",
            description: "Essential for brain health and reducing inflammation.",
            dosage: "1000-2000mg daily",
            benefits: ["Reduces depression", "Anti-inflammatory", "Supports brain function"],
          },
        ],
        remedies: [
          "Maintain regular sleep schedule (7-9 hours)",
          "Practice mindfulness and meditation",
          "Regular aerobic exercise (30 minutes daily)",
          "Limit caffeine and alcohol intake",
        ],
      },
      indian: {
        title: "Indian Approach (Ayurvedic)",
        description: "Focuses on balancing Pitta dosha and calming the nervous system.",
        ingredients: [
          {
            name: "Ashwagandha",
            description: "Adaptogenic herb that helps manage stress and balance hormones.",
            dosage: "300-500mg twice daily",
            benefits: ["Reduces stress", "Balances hormones", "Improves sleep"],
          },
          {
            name: "Brahmi",
            description: "Enhances cognitive function and reduces anxiety.",
            dosage: "1 tsp powder with warm milk",
            benefits: ["Calms mind", "Improves memory", "Reduces anxiety"],
          },
        ],
        remedies: [
          "Practice Pranayama (breathing exercises) daily",
          "Drink chamomile tea before bedtime",
          "Apply cooling sandalwood paste on forehead",
          "Follow a Sattvic diet with fresh, pure foods",
        ],
      },
    },
    "body-pain": {
      western: {
        title: "Western Approach",
        description: "Muscle tension and inflammation due to hormonal changes.",
        ingredients: [
          {
            name: "Calcium",
            description: "Essential for muscle function and reducing cramping.",
            dosage: "1000-1200mg daily",
            benefits: ["Reduces muscle cramps", "Supports bone health", "Improves muscle function"],
          },
          {
            name: "Vitamin D",
            description: "Helps calcium absorption and reduces inflammation.",
            dosage: "1000-2000 IU daily",
            benefits: ["Improves calcium absorption", "Reduces inflammation", "Supports immune function"],
          },
        ],
        remedies: [
          "Gentle stretching and yoga",
          "Hot/cold therapy alternation",
          "Massage with anti-inflammatory creams",
          "Maintain good posture and ergonomics",
        ],
      },
      indian: {
        title: "Indian Approach (Ayurvedic)",
        description: "Balancing Vata dosha and improving circulation.",
        ingredients: [
          {
            name: "Nirgundi",
            description: "Natural pain reliever and anti-inflammatory herb.",
            dosage: "Oil for external massage",
            benefits: ["Reduces joint pain", "Anti-inflammatory", "Improves circulation"],
          },
          {
            name: "Guggul",
            description: "Helps reduce inflammation and supports joint health.",
            dosage: "500mg twice daily",
            benefits: ["Reduces inflammation", "Supports joint health", "Improves mobility"],
          },
        ],
        remedies: [
          "Abhyanga (oil massage) with warm sesame oil",
          "Practice gentle yoga asanas",
          "Apply warm mustard oil with camphor",
          "Take warm baths with rock salt",
        ],
      },
    },
  }

  const currentTreatment = treatments[selectedSymptom as keyof typeof treatments]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Treatment Approaches</h1>
          <p className="text-muted-foreground">
            Discover both traditional Indian wisdom and modern Western solutions for your symptoms
          </p>
        </div>

        {/* Symptom Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Your Symptom</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {symptoms.map((symptom) => (
              <Card
                key={symptom.id}
                className={`cursor-pointer transition-all ${
                  selectedSymptom === symptom.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedSymptom(symptom.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <symptom.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{symptom.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Treatment Approaches */}
        <Tabs defaultValue="western" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="western" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Western Approach
            </TabsTrigger>
            <TabsTrigger value="indian" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Indian Approach
            </TabsTrigger>
          </TabsList>

          <TabsContent value="western" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  {currentTreatment.western.title}
                </CardTitle>
                <CardDescription>{currentTreatment.western.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-secondary" />
                    Key Ingredients (Supplements)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentTreatment.western.ingredients.map((ingredient, index) => (
                      <Card key={index} className="border-l-4 border-l-secondary">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{ingredient.name}</CardTitle>
                          <Badge variant="outline">{ingredient.dosage}</Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{ingredient.description}</p>
                          <div>
                            <p className="text-sm font-medium mb-2">Benefits:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {ingredient.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Remedies */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recommended Remedies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentTreatment.western.remedies.map((remedy, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm">{remedy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="indian" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  {currentTreatment.indian.title}
                </CardTitle>
                <CardDescription>{currentTreatment.indian.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-secondary" />
                    Key Ingredients (Natural Herbs)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentTreatment.indian.ingredients.map((ingredient, index) => (
                      <Card key={index} className="border-l-4 border-l-accent">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{ingredient.name}</CardTitle>
                          <Badge variant="secondary">{ingredient.dosage}</Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{ingredient.description}</p>
                          <div>
                            <p className="text-sm font-medium mb-2">Benefits:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {ingredient.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Remedies */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Traditional Remedies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentTreatment.indian.remedies.map((remedy, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm">{remedy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Save to My Treatments
          </Button>
          <Button size="lg" variant="outline" className="flex items-center gap-2 bg-transparent">
            <Droplets className="h-4 w-4" />
            Set Reminders
          </Button>
        </div>
      </div>
    </div>
  )
}
