import gql from 'graphql-tag'

const getAllEvents = gql`
  query getAllEvents {
    events {
      host_id
    }
  }
`

export default getAllEvents
