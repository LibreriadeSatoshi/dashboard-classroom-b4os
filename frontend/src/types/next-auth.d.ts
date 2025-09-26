declare module 'next-auth' {
  interface Session {
    user: {
      githubUsername: string
      role: 'administrator' | 'dev'
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    githubUsername: string
    role: 'administrator' | 'dev'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    githubUsername: string
    role: 'administrator' | 'dev'
  }
}