import axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-z0de2qbw5uhokbxb.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  logger.info('Authorizing a user', { event })
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification

  logger.info('Fetching certificate', { jwksUrl });

  const cert = await axios.get(jwksUrl).then(response => {
    const keys = response.data.keys
    const signingKey = keys.find(key => key.kid === jwt.header.kid)
    const certif = signingKey.x5c[0].replace(/\\n/g, '\n')
    return "-----BEGIN CERTIFICATE-----" + "\n" + certif + "\n" + "-----END CERTIFICATE-----"
  })

  logger.info('Verifying token', { jwt, cert })
  return jsonwebtoken.verify(token, cert, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
