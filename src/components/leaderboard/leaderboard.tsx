import { LeaderboardCard } from "~/components/leaderboard/leaderboard-card"
import { primaryLeaderboard, achievementLeaderboards } from "~/lib/mock-data"

export function Leaderboard() {
  return (
    <main className="bg-gray-950 text-white min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <h1 className="text-4xl font-bold text-center text-indigo-400 tracking-wider">Leaderboards</h1>

        {/* Primary Leaderboard */}
        <section>
          <LeaderboardCard leaderboard={primaryLeaderboard} />
        </section>

        {/* Achievement Leaderboards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievementLeaderboards.map((lb) => (
              <LeaderboardCard key={lb.id} leaderboard={lb} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}