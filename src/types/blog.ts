export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: BlogCategory;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: string;
  updatedAt: string;
  readTime: number; // in minutes
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export enum BlogCategory {
  RECIPES = "recipes",
  HEALTH_TIPS = "health-tips", 
  NUTRITION = "nutrition",
  LIFESTYLE = "lifestyle",
  INGREDIENT_GUIDE = "ingredient-guide",
  SEASONAL = "seasonal"
}

export interface Recipe extends BlogPost {
  recipe: {
    ingredients: RecipeIngredient[];
    instructions: string[];
    prepTime: number; // in minutes
    cookTime: number; // in minutes
    servings: number;
    difficulty: "easy" | "medium" | "hard";
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}