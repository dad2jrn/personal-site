import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),       // "2024-01"
    endDate: z.string().nullable(), // null = present
    location: z.string(),
    sector: z.enum(['banking', 'fortune-100', 'gov-public', 'consulting', 'military']),
    featured: z.boolean().default(false),
    order: z.number(),           // for ties; lower = appears first
    summary: z.string(),         // 1-2 sentence summary
    shortCompany: z.string().optional(),  // timeline display name when company is too long
    tag: z.string().optional(),           // timeline category tag override (defaults from sector)
    achievements: z.array(z.string()).optional(), // bullet points for resume
  }),
});

const patents = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/patents' }),
  schema: z.object({
    title: z.string(),
    patentNumber: z.string(),    // USPTO number e.g. "US 11,238,541 B2"
    filedDate: z.string().optional(),
    grantedDate: z.string().optional(),
    inventors: z.array(z.string()),
    assignee: z.string(),
    abstract: z.string(),        // PARAPHRASED in Ron's words, not USPTO copy
    tags: z.array(z.string()).default([]),
    usptoUrl: z.url().optional(), // Zod 4: z.string().url() is gone
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    role: z.string(),
    period: z.string(),          // "2016 – 2023"
    dek: z.string(),             // 1-line subtitle, used on detail page
    summary: z.string(),         // 2-3 sentence summary for the index card
    scale: z.array(z.object({    // metrics surfaced in sidebar
      label: z.string(),
      value: z.string(),
    })),
    tools: z.array(z.string()),  // e.g. ["AWS", "Kubernetes", "Kafka"]
    outcomes: z.array(z.string()),
    publishedAt: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(99),        // homepage card order; lower first
    cardHeader: z.string().optional(),    // mono header on the homepage card
    cardSummary: z.string().optional(),   // homepage card description (falls back to dek)
    cardTags: z.array(z.string()).optional(), // homepage card chips (falls back to tools)
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { experience, patents, 'case-studies': caseStudies, writing };
