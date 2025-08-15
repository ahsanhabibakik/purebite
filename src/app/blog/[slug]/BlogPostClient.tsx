"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Facebook, 
  Twitter,
  ChevronLeft,
  BookOpen,
  ChefHat,
  Timer,
  Star,
  ArrowRight,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogPost, Recipe, BlogCategory } from "@/types/blog";

const categoryLabels = {
  [BlogCategory.RECIPES]: "রেসিপি",
  [BlogCategory.HEALTH_TIPS]: "স্বাস্থ্য টিপস",
  [BlogCategory.NUTRITION]: "পুষ্টি",
  [BlogCategory.LIFESTYLE]: "জীবনযাত্রা",
  [BlogCategory.INGREDIENT_GUIDE]: "উপাদান গাইড",
  [BlogCategory.SEASONAL]: "মৌসুমী"
};

const difficultyLabels = {
  easy: "সহজ",
  medium: "মাঝারি",
  hard: "কঠিন"
};

interface BlogPostClientProps {
  post: BlogPost;
  recipe?: Recipe;
  relatedPosts: BlogPost[];
}

export function BlogPostClient({ post, recipe, relatedPosts }: BlogPostClientProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${post.title} - পিউর বাইট`;

  const handleShare = (platform: string) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      copy: shareUrl
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      alert('লিংক কপি হয়েছে!');
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-600">হোম</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-green-600">ব্লগ</Link>
          <span>/</span>
          <Link href={`/blog?category=${post.category}`} className="hover:text-green-600">
            {categoryLabels[post.category]}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{post.title}</span>
        </div>
      </nav>

      {/* Back Button */}
      <Button variant="outline" asChild className="mb-6">
        <Link href="/blog">
          <ChevronLeft className="w-4 h-4 mr-2" />
          ব্লগে ফিরে যান
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute left-6 top-6">
              <Badge className="bg-green-600 text-white">
                {categoryLabels[post.category]}
              </Badge>
            </div>

            {/* Featured Badge */}
            {post.featured && (
              <div className="absolute right-6 top-6">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  ফিচার্ড
                </Badge>
              </div>
            )}
          </div>

          {/* Post Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{post.author.name}</div>
                  {post.author.bio && (
                    <div className="text-xs text-gray-500">{post.author.bio}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime} মিনিট পড়ার সময়
              </div>

              {/* Share Button */}
              <div className="relative ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  শেয়ার করুন
                </Button>
                
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-[150px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('facebook')}
                      className="w-full justify-start"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                      className="w-full justify-start"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('copy')}
                      className="w-full justify-start"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      লিংক কপি করুন
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?search=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Recipe Info Card (if it's a recipe) */}
          {recipe && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">রেসিপি তথ্য</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{recipe.recipe.prepTime}</div>
                  <div className="text-sm text-gray-600">প্রস্তুতি (মিনিট)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{recipe.recipe.cookTime}</div>
                  <div className="text-sm text-gray-600">রান্নার সময় (মিনিট)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{recipe.recipe.servings}</div>
                  <div className="text-sm text-gray-600">পরিবেশন</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {difficultyLabels[recipe.recipe.difficulty]}
                  </div>
                  <div className="text-sm text-gray-600">কঠিনতা</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">উপকরণ:</h4>
                <ul className="space-y-2">
                  {recipe.recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      <span>
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                        {ingredient.notes && (
                          <span className="text-gray-500 text-sm"> ({ingredient.notes})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nutrition Info */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">পুষ্টিগুণ (প্রতি পরিবেশনায়):</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="font-bold text-green-600">{recipe.recipe.nutrition.calories}</div>
                    <div className="text-xs text-gray-600">ক্যালোরি</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="font-bold text-green-600">{recipe.recipe.nutrition.protein}গ</div>
                    <div className="text-xs text-gray-600">প্রোটিন</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="font-bold text-green-600">{recipe.recipe.nutrition.carbs}গ</div>
                    <div className="text-xs text-gray-600">কার্বস</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="font-bold text-green-600">{recipe.recipe.nutrition.fat}গ</div>
                    <div className="text-xs text-gray-600">চর্বি</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="font-bold text-green-600">{recipe.recipe.nutrition.fiber}গ</div>
                    <div className="text-xs text-gray-600">ফাইবার</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipe Instructions (if it's a recipe) */}
          {recipe && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                প্রস্তুত প্রণালী
              </h3>
              <ol className="space-y-4">
                {recipe.recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700 leading-relaxed">{instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-4">লেখক সম্পর্কে</h4>
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <h5 className="font-bold text-gray-900">{post.author.name}</h5>
                {post.author.bio && (
                  <p className="text-gray-600 mt-1">{post.author.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                সংশ্লিষ্ট পোস্ট
              </h3>
              <div className="space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {relatedPost.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(relatedPost.publishedAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <Button asChild className="w-full mt-4">
                <Link href="/blog">
                  আরও পোস্ট দেখুন
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">নিয়মিত আপডেট পান</h3>
            <p className="text-gray-600 text-sm mb-4">
              নতুন রেসিপি, স্বাস্থ্য টিপস এবং পুষ্টি গাইড সবার আগে পেতে নিউজলেটার সাবস্ক্রাইব করুন।
            </p>
            <Button asChild className="w-full">
              <Link href="/#newsletter">
                সাবস্ক্রাইব করুন
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}