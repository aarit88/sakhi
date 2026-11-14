import prisma from "../../prisma"

export const getTools = (userId: string) => {
  return [
    {
      name: "getUserProfile",
      description: "Gets the user profile information.",
      execute: async () => {
        if (!userId) return {}
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        })
        return user || {}
      },
    },
    {
      name: "getHealthData",
      description: "Gets the user's logged health data.",
      execute: async () => {
        if (!userId) return {}
        const [periods, symptoms, moods, sleeps] = await Promise.all([
          prisma.periodLog.findMany({ where: { userId }, orderBy: { startDate: "desc" }, take: 5 }),
          prisma.symptomLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
          prisma.moodLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
          prisma.sleepLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 7 }),
        ])
        return { periods, symptoms, moods, sleeps }
      },
    },
  ]
}
