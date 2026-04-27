import { defineCollection, z } from 'astro:content';

const experience = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),       // "2024-01"
    endDate: z.string().nullable(), // null = present
    location: z.string(),
    sector: z.enum(['fortune-100', 'gov-public', 'consulting', 'military']),
    featured: z.boolean().default(false),
    order: z.number(),           // for ties; lower = appears first
    summary: z.string(),         // 1-2 sentence summary
    achievements: z.array(z.string()).optional(), // bullet points for resume
  }),
});

const patents = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    patentNumber: z.string(),    // USPTO number e.g. "US 11,238,541 B2"
    filedDate: z.string().optional(),
    grantedDate: z.string().optional(),
    inventors: z.array(z.string()),
    assignee: z.string(),
    abstract: z.string(),        // PARAPHRASED in Ron's words, not USPTO copy
    usptoUrl: z.string().url().optional(),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
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
  }),
});

const writing = defineCollection({
  type: 'content',
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