import { createFileRoute } from '@tanstack/react-router'
import PublicStream from '../components/PublicStream'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Game Stream
      </h1>
      <PublicStream />
    </div>
  )
}
