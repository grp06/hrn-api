import gql from 'graphql-tag'

const updateRoomPassword = gql`
  mutation updateRoomPassword($roomId: Int!, $password: String!) {
    update_rooms_by_pk(pk_columns: {id: $roomId}, _set: {locked: true, password: $password}) {
      id
      locked
    }
  }
`;

export default updateRoomPassword