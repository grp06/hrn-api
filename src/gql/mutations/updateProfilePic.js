import gql from 'graphql-tag'

const updateProfilePic = gql`
  mutation($id: Int!, $profile_pic_url: String!) {
    update_users(where: { id: { _eq: $id } }, _set: { profile_pic_url: $profile_pic_url }) {
      returning {
        profile_pic_url
      }
    }
  }
`
export default updateProfilePic
