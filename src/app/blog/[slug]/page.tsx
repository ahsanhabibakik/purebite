import { notFound } from "next/navigation";
import { Metadata } from "next";
import { blogPosts, recipes } from "@/data/blog";
import { BlogPostClient } from "./BlogPostClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return {
      title: "পোস্ট পাওয়া যায়নি - পিউর বাইট",
      description: "এই ব্লগ পোস্টটি পাওয়া যায়নি।"
    };
  }

  return {
    title: post.seoTitle || `${post.title} - পিউর বাইট`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage]
    }
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    notFound();
  }

  // Check if this is a recipe post
  const recipe = recipes.find(r => r.slug === slug);
  
  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <BlogPostClient 
      post={post} 
      recipe={recipe} 
      relatedPosts={relatedPosts} 
    />
  );
}