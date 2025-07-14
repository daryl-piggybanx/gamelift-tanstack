import { SignIn } from '@clerk/tanstack-react-start'
import { Button } from '~/components/ui/button'
import logo from '~/assets/Logo-Bolt-White.png'
import { createFileRoute } from '@tanstack/react-router'
import LoginForm from '~/components/forms/login'
import WaitlistForm from '~/components/forms/waitlist'

export const Route = createFileRoute('/sign-in')({
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
            {/* <SignIn /> */}
            <div className="flex flex-col items-center text-center">
              <a href="https://www.piggybanx.com/" className="flex items-center justify-center">
                <img src={logo} alt="PiggyBanx Logo" width={48} height={48} className="mb-4" />
              </a>
              {/* <h1 className="text-2xl font-bold tracking-tight">Into the PiggyVerse</h1> */}
              
              <div className="w-full mt-6  bg-cover bg-center bg-no-repeat">
                <SignIn 
                  routing="virtual"
                  fallbackRedirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                    //   card: "w-full shadow-none border-0 bg-black/25",
                      headerTitle: "hidden",
                      header: "hidden",
                    },
                    layout: {
                      logoImageUrl: logo,
                      logoLinkUrl: "https://www.piggybanx.com/",
                      logoPlacement: "inside",
                      shimmer: true,
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
} 