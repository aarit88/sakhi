import { NextResponse } from "next/server"

// Mock traditional recipe data
const recipes = [
  {
    id: "golden-milk",
    name: "Haldi Doodh (Golden Milk)",
    category: "beverages",
    prepTime: 5,
    servings: 1,
    difficulty: "easy",
    ingredients: ["1 cup milk", "1/2 tsp turmeric", "Pinch of black pepper", "1 tsp ghee", "Honey to taste"],
    instructions: [
      "Heat milk in a saucepan",
      "Add turmeric and black pepper",
      "Simmer for 2-3 minutes",
      "Add ghee and honey",
      "Serve warm before bedtime",
    ],
    benefits: ["Anti-inflammatory", "Better sleep", "Immunity boost"],
    ayurvedicProperties: "Balances all three doshas, especially Vata and Kapha",
    favorited: false,
  },
  {
    id: "khichdi",
    name: "Moong Dal Khichdi",
    category: "main-course",
    prepTime: 25,
    servings: 4,
    difficulty: "easy",
    ingredients: ["1 cup rice", "1/2 cup moong dal", "1 tsp ghee", "Cumin seeds", "Ginger", "Turmeric", "Salt"],
    instructions: [
      "Wash rice and dal together",
      "Heat ghee, add cumin seeds",
      "Add ginger and turmeric",
      "Add rice-dal mixture with water",
      "Cook until soft and mushy",
      "Season with salt",
    ],
    benefits: ["Easy digestion", "Complete protein", "Detoxifying"],
    ayurvedicProperties: "Tridoshic - suitable for all body types, especially during illness",
    favorited: false,
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: recipes,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch recipes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recipeId, action } = body

    if (action === "favorite") {
      const recipe = recipes.find((r) => r.id === recipeId)
      if (recipe) {
        recipe.favorited = !recipe.favorited
      }

      return NextResponse.json({
        success: true,
        message: "Recipe favorite status updated",
        data: { recipeId, favorited: recipe?.favorited },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update recipe" }, { status: 500 })
  }
}
