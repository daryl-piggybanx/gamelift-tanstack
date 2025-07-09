import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getAuth } from '@clerk/tanstack-react-start/server'
import { getWebRequest } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { authStateFn } from '~/integrations/clerk/service'
import { Leaderboard } from '~/components/leaderboard/leaderboard'

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId }
  },
})

function Home() {
  const state = Route.useLoaderData()
  return (
    <div className="container mx-auto p-8"> 
      <Leaderboard />
    </div>
  )
}
