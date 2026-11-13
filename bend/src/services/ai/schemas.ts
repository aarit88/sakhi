import { z } from "zod"

export const aiQuerySchema = z.object({
  query: z.string().min(1).max(2000),
  contextOverrides: z.record(z.any()).optional()
})

export type AIQuery = z.infer<typeof aiQuerySchema>
