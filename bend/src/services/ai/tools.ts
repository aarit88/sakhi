export const getTools = (userId: string) => {
  return [
    {
      name: "getUserProfile",
      description: "Gets the user profile information.",
      execute: async () => { /* fetching logic */ return {} }
    },
    {
      name: "getHealthData",
      description: "Gets the user's logged health data.",
      execute: async () => { /* fetching logic */ return [] }
    }
    // other tools...
  ]
}
