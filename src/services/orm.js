// import 'dotenv/config';

import axios from 'axios'
import { print } from 'graphql'
import { constants } from '../extensions/jwtHelper.js'

const request = async (gqlQuery, variables = {}, token) => {
  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  } else {
    headers[constants.adminSecret] = process.env.HASURA_GRAPHQL_ACCESS_KEY
  }
  console.log('request -> headers', headers)

  try {
    const result = await axios.post(
      process.env.HASURA_ENDPOINT,
      // "http://localhost:8080/v1/graphql",
      {
        query: print(gqlQuery),
        variables: variables,
      },
      {
        headers: headers,
      }
    )
    console.log('request -> result', result)

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
