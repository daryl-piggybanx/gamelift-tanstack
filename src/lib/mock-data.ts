import type { LeaderboardData } from "~/components/leaderboard/types"

const generateUsers = (count: number, scoreMultiplier: number) => {
  const users = []
  const names = [
    "ShadowStriker",
    "CyberNinja",
    "PixelPioneer",
    "QuantumLeap",
    "VortexViper",
    "Ironclad",
    "StarGazer",
    "GhostRider",
    "NightHawk",
    "BlazeFury",
    "ArcticFox",
    "SolarFlare",
    "ThunderBolt",
    "MysticMage",
    "RogueShadow",
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
      avatar: `/placeholder.svg?width=48&height=48&query=${names[nameIndex]}`,
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
    id: "headshots",
    title: "Most Headshots",
    users: generateUsers(15, 1.2),
  },
  {
    id: "speedrun",
    title: "Fastest Speedrun",
    users: generateUsers(15, 0.8),
  },
  {
    id: "treasures",
    title: "Treasures Found",
    users: generateUsers(15, 1),
  },
  {
    id: "combos",
    title: "Highest Combo",
    users: generateUsers(15, 1.3),
  },
]
