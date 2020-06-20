// import 'dotenv/config';

import axios from 'axios'
import { print } from 'graphql'
import { constants } from '../extensions/jwtHelper.js'
import { HASURA_ENDPOINT } from '../config'

const request = async (gqlQuery, variables = {}, token) => {
  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  } else {
    headers[constants.adminSecret] = process.env.HASURA_GRAPHQL_ACCESS_KEY
  }
  console.log('request -> headers', headers)
  console.log(HASURA_ENDPOINT);

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
