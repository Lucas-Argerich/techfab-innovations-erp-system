import cors from 'cors'

const ACCEPTED_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      if (origin !== undefined && acceptedOrigins.includes(origin)) {
        callback(null, true)
      } else if (origin === undefined) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS policy.'))
      }
    }
  })
