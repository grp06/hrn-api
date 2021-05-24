import axios from 'axios'
import { print } from 'graphql'

import { HASURA_ENDPOINT } from '../config'
import { constants } from '../extensions/jwtHelper'

const request = async (gqlQuery, variables = {}, token) => {
  const headers = {}
  console.log('🚀 ~ HASURA_ENDPOINT', HASURA_ENDPOINT)
  console.log('🚀 ~ request ~ token', token)

  if (token) {
    headers.Authorization = `Bearer ${token}`
  } else {
    headers[constants.adminSecret] = process.env.HASURA_GRAPHQL_ADMIN_SECRET
  }

  try {
    const result = await axios.post(
      HASURA_ENDPOINT,
      {
        query: print(gqlQuery),
        variables: variables,
      },
      {
        headers: headers,
      }
    )

    if (result.data) {
      return result.data
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

export default {
  request,
}
