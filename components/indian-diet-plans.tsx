"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Leaf,
  Clock,
  Users,
  ChefHat,
  Star,
  Heart,
  Zap,
  Shield,
  Flower,
  Sun,
  Moon,
  Utensils,
  Apple,
  Coffee,
} from "lucide-react"

export function IndianDietPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([])

  const toggleFavorite = (recipeId: string) => {
    setFavoriteRecipes((prev) => (prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]))
  }

  const ayurvedicPlans = [
    {
      id: "vata-balance",
      name: "Vata Balancing Diet",
      dosha: "Vata",
      description: "Warm, nourishing foods to ground and stabilize",
      duration: "7 days",
      difficulty: "Easy",
      benefits: ["Reduces anxiety", "Improves digestion", "Better sleep"],
      color: "from-amber-400 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      icon: Leaf,
      meals: {
        breakfast: [
          { name: "Warm Oats with Ghee & Dates", time: "7:00 AM", calories: 320 },
          { name: "Ginger Tea with Jaggery", time: "7:30 AM", calories: 45 },
        ],
        lunch: [
          { name: "Khichdi with Vegetables", time: "12:30 PM", calories: 450 },
          { name: "Buttermilk with Cumin", time: "1:00 PM", calories: 80 },
        ],
        dinner: [
          { name: "Moong Dal Soup", time: "7:00 PM", calories: 280 },
          { name: "Warm Milk with Turmeric", time: "9:00 PM", calories: 150 },
        ],
      },
    },
    {
      id: "pitta-cooling",
      name: "Pitta Cooling Diet",
      dosha: "Pitta",
      description: "Cool, sweet foods to reduce heat and inflammation",
      duration: "7 days",
      difficulty: "Easy",
      benefits: ["Reduces inflammation", "Calms mind", "Improves skin"],
      color: "from-green-400 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      icon: Flower,
      meals: {
        breakfast: [
          { name: "Coconut Rice with Cardamom", time: "7:00 AM", calories: 290 },
          { name: "Rose Water with Mint", time: "7:30 AM", calories: 25 },
        ],
        lunch: [
          { name: "Cucumber Raita with Rice", time: "12:30 PM", calories: 380 },
          { name: "Sweet Lassi", time: "1:00 PM", calories: 120 },
        ],
        dinner: [
          { name: "Bottle Gourd Curry", time: "7:00 PM", calories: 250 },
          { name: "Fennel Tea", time: "9:00 PM", calories: 15 },
        ],
      },
    },
    {
      id: "kapha-energizing",
      name: "Kapha Energizing Diet",
      dosha: "Kapha",
      description: "Light, spicy foods to boost metabolism",
      duration: "7 days",
      difficulty: "Medium",
      benefits: ["Boosts energy", "Aids weight loss", "Improves circulation"],
      color: "from-red-400 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      icon: Zap,
      meals: {
        breakfast: [
          { name: "Spiced Quinoa Upma", time: "7:00 AM", calories: 280 },
          { name: "Ginger Lemon Tea", time: "7:30 AM", calories: 20 },
        ],
        lunch: [
          { name: "Spicy Lentil Curry", time: "12:30 PM", calories: 420 },
          { name: "Turmeric Buttermilk", time: "1:00 PM", calories: 70 },
        ],
        dinner: [
          { name: "Vegetable Soup with Pepper", time: "7:00 PM", calories: 200 },
          { name: "Herbal Detox Tea", time: "9:00 PM", calories: 10 },
        ],
      },
    },
  ]

  const cycleBasedPlans = [
    {
      id: "menstrual-phase",
      name: "Menstrual Phase Nutrition",
      phase: "Days 1-5",
      description: "Iron-rich, warming foods for comfort and energy",
      duration: "5 days",
      difficulty: "Easy",
      benefits: ["Reduces cramps", "Boosts iron", "Provides comfort"],
      color: "from-rose-400 to-pink-500",
      bgColor: "from-rose-50 to-pink-50",
      icon: Heart,
      specialFoods: ["Dates", "Sesame seeds", "Jaggery", "Warm spices"],
      meals: {
        breakfast: [
          { name: "Date & Almond Porridge", time: "7:00 AM", calories: 350 },
          { name: "Saffron Milk", time: "7:30 AM", calories: 180 },
        ],
        lunch: [
          { name: "Spinach Dal with Ghee", time: "12:30 PM", calories: 480 },
          { name: "Beetroot Juice", time: "1:00 PM", calories: 90 },
        ],
        dinner: [
          { name: "Sesame Laddu (2 pieces)", time: "7:00 PM", calories: 320 },
          { name: "Warm Turmeric Milk", time: "9:00 PM", calories: 160 },
        ],
      },
    },
    {
      id: "follicular-phase",
      name: "Follicular Phase Boost",
      phase: "Days 6-14",
      description: "Fresh, energizing foods to support new growth",
      duration: "9 days",
      difficulty: "Easy",
      benefits: ["Increases energy", "Supports hormones", "Enhances mood"],
      color: "from-green-400 to-teal-500",
      bgColor: "from-green-50 to-teal-50",
      icon: Sun,
      specialFoods: ["Sprouts", "Fresh fruits", "Leafy greens", "Seeds"],
      meals: {
        breakfast: [
          { name: "Sprout Salad with Lemon", time: "7:00 AM", calories: 220 },
          { name: "Green Tea with Honey", time: "7:30 AM", calories: 35 },
        ],
        lunch: [
          { name: "Mixed Vegetable Curry", time: "12:30 PM", calories: 400 },
          { name: "Fresh Fruit Bowl", time: "1:00 PM", calories: 150 },
        ],
        dinner: [
          { name: "Quinoa Salad with Herbs", time: "7:00 PM", calories: 320 },
          { name: "Chamomile Tea", time: "9:00 PM", calories: 5 },
        ],
      },
    },
    {
      id: "luteal-phase",
      name: "Luteal Phase Support",
      phase: "Days 15-28",
      description: "Grounding, magnesium-rich foods for PMS relief",
      duration: "14 days",
      difficulty: "Medium",
      benefits: ["Reduces PMS", "Stabilizes mood", "Improves sleep"],
      color: "from-purple-400 to-indigo-500",
      bgColor: "from-purple-50 to-indigo-50",
      icon: Moon,
      specialFoods: ["Dark chocolate", "Pumpkin seeds", "Leafy greens", "Whole grains"],
      meals: {
        breakfast: [
          { name: "Ragi Porridge with Nuts", time: "7:00 AM", calories: 340 },
          { name: "Herbal Tea Blend", time: "7:30 AM", calories: 15 },
        ],
        lunch: [
          { name: "Brown Rice with Rajma", time: "12:30 PM", calories: 520 },
          { name: "Pumpkin Seed Smoothie", time: "1:00 PM", calories: 180 },
        ],
        dinner: [
          { name: "Palak Paneer with Roti", time: "7:00 PM", calories: 450 },
          { name: "Golden Milk", time: "9:00 PM", calories: 140 },
        ],
      },
    },
  ]

  const traditionalRecipes = [
    {
      id: "golden-milk",
      name: "Haldi Doodh (Golden Milk)",
      category: "Beverages",
      time: "5 min",
      servings: 1,
      difficulty: "Easy",
      benefits: ["Anti-inflammatory", "Better sleep", "Immunity boost"],
      ingredients: ["1 cup milk", "1/2 tsp turmeric", "Pinch of black pepper", "1 tsp ghee", "Honey to taste"],
      instructions: [
        "Heat milk in a saucepan",
        "Add turmeric and black pepper",
        "Simmer for 2-3 minutes",
        "Add ghee and honey",
        "Serve warm before bedtime",
      ],
      ayurvedicProperties: "Balances all three doshas, especially Vata and Kapha",
    },
    {
      id: "khichdi",
      name: "Moong Dal Khichdi",
      category: "Main Course",
      time: "25 min",
      servings: 4,
      difficulty: "Easy",
      benefits: ["Easy digestion", "Complete protein", "Detoxifying"],
      ingredients: ["1 cup rice", "1/2 cup moong dal", "1 tsp ghee", "Cumin seeds", "Ginger", "Turmeric", "Salt"],
      instructions: [
        "Wash rice and dal together",
        "Heat ghee, add cumin seeds",
        "Add ginger and turmeric",
        "Add rice-dal mixture with water",
        "Cook until soft and mushy",
        "Season with salt",
      ],
      ayurvedicProperties: "Tridoshic - suitable for all body types, especially during illness",
    },
    {
      id: "sesame-laddu",
      name: "Til ke Laddu",
      category: "Sweets",
      time: "20 min",
      servings: 12,
      difficulty: "Medium",
      benefits: ["Rich in calcium", "Warming", "Energy boost"],
      ingredients: ["1 cup sesame seeds", "3/4 cup jaggery", "1 tsp ghee", "Cardamom powder"],
      instructions: [
        "Dry roast sesame seeds until golden",
        "Melt jaggery with little water",
        "Mix roasted seeds with jaggery syrup",
        "Add cardamom powder",
        "Shape into small balls while warm",
      ],
      ayurvedicProperties: "Excellent for Vata dosha, provides warmth and nourishment",
    },
  ]

  const renderMealPlan = (plan: any) => (
    <Card
      key={plan.id}
      className={`overflow-hidden bg-gradient-to-br ${plan.bgColor} border-0 hover:shadow-lg transition-all duration-300`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
            <plan.icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{plan.difficulty}</Badge>
            <Badge variant="secondary">{plan.duration}</Badge>
          </div>
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        {plan.dosha && <Badge className="w-fit">{plan.dosha} Dosha</Badge>}
        {plan.phase && <Badge className="w-fit bg-pink-100 text-pink-700">{plan.phase}</Badge>}
        <p className="text-sm text-gray-600">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="text-sm font-medium">{plan.duration}</div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
          <div>
            <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="text-sm font-medium">1 Person</div>
            <div className="text-xs text-gray-500">Serving</div>
          </div>
          <div>
            <ChefHat className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="text-sm font-medium">{plan.difficulty}</div>
            <div className="text-xs text-gray-500">Level</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Benefits:</div>
          <div className="flex flex-wrap gap-1">
            {plan.benefits.map((benefit: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {plan.specialFoods && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Special Foods:</div>
            <div className="flex flex-wrap gap-1">
              {plan.specialFoods.map((food: string, index: number) => (
                <Badge key={index} className="text-xs bg-green-100 text-green-700">
                  {food}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="meals">
            <AccordionTrigger className="text-sm">View Daily Meal Plan</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {Object.entries(plan.meals).map(([mealType, meals]: [string, any]) => (
                  <div key={mealType} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {mealType === "breakfast" && <Coffee className="w-4 h-4 text-orange-500" />}
                      {mealType === "lunch" && <Utensils className="w-4 h-4 text-green-500" />}
                      {mealType === "dinner" && <Apple className="w-4 h-4 text-purple-500" />}
                      <span className="text-sm font-medium capitalize">{mealType}</span>
                    </div>
                    {meals.map((meal: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                        <div>
                          <div className="text-sm font-medium">{meal.name}</div>
                          <div className="text-xs text-gray-500">{meal.time}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {meal.calories} cal
                        </Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          onClick={() => setSelectedPlan(plan.id)}
          className={`w-full ${selectedPlan === plan.id ? "bg-green-500 hover:bg-green-600" : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"}`}
        >
          {selectedPlan === plan.id ? (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Following This Plan
            </>
          ) : (
            "Start This Plan"
          )}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <section id="diet" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Traditional{" "}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Indian Nutrition
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ancient Ayurvedic wisdom meets modern women's health. Discover personalized diet plans based on your dosha
            and menstrual cycle for optimal wellness and vitality.
          </p>
        </div>

        <Tabs defaultValue="ayurvedic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ayurvedic" className="flex items-center space-x-2">
              <Leaf className="w-4 h-4" />
              <span>Ayurvedic Plans</span>
            </TabsTrigger>
            <TabsTrigger value="cycle" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Cycle-Based</span>
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4" />
              <span>Traditional Recipes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ayurvedic" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{ayurvedicPlans.map(renderMealPlan)}</div>
          </TabsContent>

          <TabsContent value="cycle" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{cycleBasedPlans.map(renderMealPlan)}</div>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {traditionalRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-white" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(recipe.id)}
                        className={favoriteRecipes.includes(recipe.id) ? "text-pink-500" : "text-gray-400"}
                      >
                        <Star className={`w-4 h-4 ${favoriteRecipes.includes(recipe.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{recipe.category}</Badge>
                      <Badge variant="secondary">{recipe.difficulty}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <div className="text-sm font-medium">{recipe.time}</div>
                        <div className="text-xs text-gray-500">Prep Time</div>
                      </div>
                      <div>
                        <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <div className="text-sm font-medium">{recipe.servings}</div>
                        <div className="text-xs text-gray-500">Servings</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Health Benefits:</div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-amber-800 mb-1">Ayurvedic Properties:</div>
                      <div className="text-xs text-amber-700">{recipe.ayurvedicProperties}</div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="recipe">
                        <AccordionTrigger className="text-sm">View Recipe</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium mb-2">Ingredients:</div>
                              <ul className="text-xs space-y-1">
                                {recipe.ingredients.map((ingredient, index) => (
                                  <li key={index} className="flex items-center">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                                    {ingredient}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">Instructions:</div>
                              <ol className="text-xs space-y-1">
                                {recipe.instructions.map((step, index) => (
                                  <li key={index} className="flex">
                                    <span className="text-pink-500 font-medium mr-2">{index + 1}.</span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dosha Quiz CTA */}
        <Card className="mt-12 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <Leaf className="w-5 h-5 mr-2" />
              Discover Your Dosha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              Not sure which Ayurvedic plan is right for you? Take our quick dosha assessment to get personalized
              recommendations.
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">Take Dosha Quiz</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
