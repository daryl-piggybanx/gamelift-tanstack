"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { LeaderboardUser } from "~/components/leaderboard/leaderboard-user"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { LeaderboardData } from "~/components/leaderboard/types"

interface LeaderboardCardProps {
  leaderboard: LeaderboardData
  defaultExpanded?: boolean
}

export function LeaderboardCard({ leaderboard, defaultExpanded = false }: LeaderboardCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const usersToShow = isExpanded ? leaderboard.users : leaderboard.users.slice(0, 5)

  return (
    <Card className="bg-gray-900/50 border-gray-800 text-white w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-indigo-400">{leaderboard.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <AnimatePresence>
            {usersToShow.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LeaderboardUser user={user} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
      {leaderboard.users.length > 5 && (
        <CardFooter className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-800 w-full"
          >
            {isExpanded ? "Show Less" : "Show More"}
            {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
