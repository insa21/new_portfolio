import { PrismaClient } from '@prisma/client';
import { articles as batch1 } from './blog-articles-1';
import { articles as batch2 } from './blog-articles-2';
import { articles as batch3 } from './blog-articles-3';
import { articles as batch4 } from './blog-articles-4';
import { articles as batch5 } from './blog-articles-5';

const prisma = new PrismaClient();

const allArticles = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];

const categories = [
  { slug: 'ai-engineering', name: 'AI Engineering' },
  { slug: 'frontend', name: 'Frontend' },
  { slug: 'backend', name: 'Backend' },
  { slug: 'system-design', name: 'System Design' },
  { slug: 'devops', name: 'DevOps' },
  { slug: 'career', name: 'Career' },
];

async function main() {
  console.log('🗑️  Deleting existing blog posts...');
  await prisma.blogPost.deleteMany();
  console.log('✅ Deleted all existing blog posts');

  // Upsert categories
  console.log('📂 Ensuring categories exist...');
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const result = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      create: { name: cat.name, slug: cat.slug },
      update: { name: cat.name },
    });
    catMap[cat.slug] = result.id;
    console.log(`  ✅ Category: ${cat.name}`);
  }

  // Get admin user
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.error('❌ No admin user found. Run main seed first.');
    process.exit(1);
  }
  console.log(`👤 Admin: ${admin.name}`);

  // Seed articles
  console.log(`\n📝 Seeding ${allArticles.length} blog articles...\n`);
  let count = 0;

  for (const a of allArticles) {
    const categoryId = catMap[a.categorySlug];
    if (!categoryId) {
      console.warn(`⚠️  Category "${a.categorySlug}" not found for "${a.title}". Skipping.`);
      continue;
    }

    await prisma.blogPost.upsert({
      where: { slug: a.slug },
      create: {
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        coverUrl: a.coverUrl,
        categoryId,
        authorId: admin.id,
        tags: a.tags,
        readTime: a.readTime,
        views: a.views,
        featured: a.featured,
        published: true,
        publishedAt: new Date(a.publishedAt),
        metaTitle: a.metaTitle,
        metaDescription: a.metaDescription,
        ogImage: a.coverUrl,
      },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        coverUrl: a.coverUrl,
        categoryId,
        tags: a.tags,
        readTime: a.readTime,
        views: a.views,
        featured: a.featured,
        published: true,
        publishedAt: new Date(a.publishedAt),
        metaTitle: a.metaTitle,
        metaDescription: a.metaDescription,
        ogImage: a.coverUrl,
      },
    });

    count++;
    console.log(`  ${count}/${allArticles.length} ✅ ${a.title}`);
  }

  console.log(`\n🎉 Blog seeding completed! ${count} articles seeded.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
