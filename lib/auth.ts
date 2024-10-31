import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // This is a placeholder - implement your actual auth logic
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Add your user verification logic here
          // Example:
          // const user = await verifyUser(credentials.email, credentials.password)
          // return user
          
          return {
            id: '1',
            email: credentials.email,
            name: 'User'
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  }
}