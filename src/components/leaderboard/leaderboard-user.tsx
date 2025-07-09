"use client"

import { motion } from "framer-motion"
import { Crown, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { cn } from "~/lib/utils"
import type { User } from "~/components/leaderboard/types"

interface LeaderboardUserProps {
  user: User
}

const rankClasses: { [key: number]: string } = {
  1: "bg-gradient-to-r from-amber-400 to-yellow-500 border-yellow-400",
  2: "bg-gradient-to-r from-slate-300 to-slate-400 border-slate-300",
  3: "bg-gradient-to-r from-amber-600 to-orange-700 border-orange-600",
}

const rankIconClasses: { [key: number]: string } = {
  1: "text-yellow-300",
  2: "text-slate-200",
  3: "text-orange-400",
}

const RankChangeIndicator = ({ change }: { change: User["change"] }) => {
  if (change === "up") {
    return <ArrowUp className="w-4 h-4 text-green-400" />
  }
  if (change === "down") {
    return <ArrowDown className="w-4 h-4 text-red-400" />
  }
  return <Minus className="w-4 h-4 text-gray-400" />
}

export function LeaderboardUser({ user }: LeaderboardUserProps) {
  const isTopThree = user.rank <= 3
  const rankClass = rankClasses[user.rank] || "bg-gray-800/80 border-gray-700"

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn("flex items-center p-3 rounded-lg transition-all duration-300 border", rankClass)}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center justify-center w-8 font-bold text-lg">
          {isTopThree ? (
            <Crown className={cn("w-6 h-6", rankIconClasses[user.rank])} fill="currentColor" />
          ) : (
            <span className="text-gray-400">{user.rank}</span>
          )}
        </div>
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={user.name}
          width={48}
          height={48}
          className="rounded-full border-2 border-gray-600 object-cover"
        />
        <div className="flex-grow">
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-sm text-gray-300">{user.score.toLocaleString()} points</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <RankChangeIndicator change={user.change} />
        </div>
      </div>
    </motion.div>
  )
}
