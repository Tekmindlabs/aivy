export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export const handleAuthError = (error: unknown) => {
  if (error instanceof AuthError) {
    return {
      error: error.message,
      statusCode: error.statusCode
    }
  }
  
  return {
    error: 'Internal server error',
    statusCode: 500
  }
}