export type User = {
  id: string
  rank: number
  name: string
  avatar: string
  score: number
  change?: "up" | "down" | "same"
}

export type LeaderboardData = {
  id: string
  title: string
  users: User[]
}
