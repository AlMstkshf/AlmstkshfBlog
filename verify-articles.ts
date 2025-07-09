#!/usr/bin/env tsx

import dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { categories, articles } from "./shared/schema";
import { eq } from "drizzle-orm";

async function verifyArticles() {
  try {
    console.log("📚 Verifying all articles in database...\n");
    
    // Get all articles with their categories
    const allArticles = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        titleEn: articles.titleEn,
        titleAr: articles.titleAr,
        categoryId: articles.categoryId,
        published: articles.published,
        featured: articles.featured,
        publishedAt: articles.publishedAt
      })
      .from(articles)
      .orderBy(articles.publishedAt);

    // Get all categories
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(c => [c.id, c]));

    console.log(`Found ${allArticles.length} articles:\n`);

    allArticles.forEach((article, index) => {
      const category = categoryMap.get(article.categoryId);
      console.log(`${index + 1}. ${article.titleEn}`);
      console.log(`   Arabic: ${article.titleAr}`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Category: ${category?.nameEn} (${category?.nameAr})`);
      console.log(`   Published: ${article.published ? '✅' : '❌'} | Featured: ${article.featured ? '⭐' : '📄'}`);
      console.log(`   Date: ${article.publishedAt?.toISOString().split('T')[0]}`);
      console.log('');
    });

    console.log(`📊 Summary:`);
    console.log(`   Total Articles: ${allArticles.length}`);
    console.log(`   Published: ${allArticles.filter(a => a.published).length}`);
    console.log(`   Featured: ${allArticles.filter(a => a.featured).length}`);
    console.log(`   Categories: ${allCategories.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verifyArticles();