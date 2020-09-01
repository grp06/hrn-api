const transformPairingsToGqlVars = ({ pairings, eventId, round }) => {
  const variablesArr = []
  pairings.forEach((pairing) => {
    variablesArr.push({
      user_id: pairing[0],
      partner_id: pairing[1],
      event_id: eventId,
      round,
    })
    variablesArr.push({
      user_id: pairing[1],
      partner_id: pairing[0],
      event_id: eventId,
      round,
    })
  })
  return variablesArr
}

export default transformPairingsToGqlVars
