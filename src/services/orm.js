// import 'dotenv/config';

import axios from 'axios'
import { print } from 'graphql'
import { constants } from '../extensions/jwtHelper.js'

const request = async (gqlQuery, variables = {}, token) => {
  console.log('request started');
  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  } else {
    headers[constants.adminSecret] = process.env.HASURA_GRAPHQL_ACCESS_KEY
  }

  try {
    const result = await axios.post(
      // 'https://hi-right-now.herokuapp.com/v1/graphql',
      'http://localhost:8080/v1/graphql',
      {
        query: print(gqlQuery),
        variables: variables,
      },
      {
        headers: headers,
      }
    )
    console.log('gota  result = ')

    if (result.data) {
      console.log('got result.data = ', result.data)
      return result.data
    }

    console.log(result.error)

    throw result.error
  } catch (error) {
    console.log(error)
    throw error
  }
}

export default {
  request,
}
