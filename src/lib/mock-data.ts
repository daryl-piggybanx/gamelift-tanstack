import type { LeaderboardData } from "~/components/leaderboard/types"
import logo from '~/assets/Logo-Bolt-White.png'

const generateUsers = (count: number, scoreMultiplier: number) => {
  const users = []
  const names = [
    "User 1",
    "User 2",
    "User 3",
    "User 4",
    "User 5",
    "User 6",
    "User 7",
    "User 8",
    "User 9",
    "User 10",
    "User 11",
    "User 12",
  ]

  for (let i = 1; i <= count; i++) {
    const nameIndex = Math.floor(Math.random() * names.length)
    const score = Math.floor((Math.random() * 50000 + 10000) * scoreMultiplier)
    const changeOptions: ("up" | "down" | "same")[] = ["up", "down", "same"]
    const change = changeOptions[Math.floor(Math.random() * 3)]

    users.push({
      id: `user-${i}-${Math.random()}`,
      rank: i,
      name: `${names[nameIndex]}${i}`,
      avatar: logo,
      score,
      change,
    })
  }
  return users.sort((a, b) => b.score - a.score).map((user, index) => ({ ...user, rank: index + 1 }))
}

export const primaryLeaderboard: LeaderboardData = {
  id: "global",
  title: "Global Ranking",
  users: generateUsers(20, 1.5),
}

export const achievementLeaderboards: LeaderboardData[] = [
  {
    id: "speedrun",
    title: "Fastest Speedrun",
    users: generateUsers(15, 0.8),
  },
  {
    id: "treasure-hunter",
    title: "Art Pieces Found",
    users: generateUsers(15, 1),
  },
  {
    id: "combos",
    title: "Highest Combo",
    users: generateUsers(15, 1.3),
  },
]
