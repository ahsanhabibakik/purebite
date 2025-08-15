import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductPageClient } from "./ProductPageClient";

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params;
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}