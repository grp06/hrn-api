import gql from 'graphql-tag'

const deleteCompositionById = gql`
  mutation deleteCompositionById($id: Int!) {
    delete_compositions(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`

export default deleteCompositionById
