import { createFileRoute } from '@tanstack/react-router'
import WaitlistForm from '~/components/forms/waitlist'

export const Route = createFileRoute('/waitlist')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
      <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 sm:p-6">
        {/* <img src={logo} alt="PiggyBanx Logo" width={24} height={24} />
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            Support
          </Button>
          <Button variant="default" size="sm">
            Contact
          </Button>
        </div> */}
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8">
          <WaitlistForm />
        </div>
      </main>
    </div>
  )
} 