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
  console.log('process.env.HASURA_ENDPOINT = ', process.env.HASURA_ENDPOINT)
  console.log('request -> variables', variables)
  console.log('request -> token', token)
  console.log('request -> headers', headers)

  try {
    const result = await axios.post(
      process.env.HASURA_ENDPOINT,
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

    console.log(result.error)

    throw result.error
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

export default {
  request,
}
