import { getAuth } from '@clerk/tanstack-react-start/server'
import { getWebRequest } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

export const authStateFn = createServerFn()
  .handler(async () => {
    const request = getWebRequest()
    const { userId } = await getAuth(request)

      if (!userId) {
    throw redirect({
      to: '/sign-in',
    })
  }

    return { userId }
})