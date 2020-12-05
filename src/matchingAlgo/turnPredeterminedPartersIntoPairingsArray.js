const checkIfEitherUserHasAlreadyBeenAssigned = (userId1, userId2, all) => {
  let eitherUserHasBeenAssigned
  all.forEach((pairing) => {
    if (pairing.includes(userId1) || pairing.includes(userId2)) {
      eitherUserHasBeenAssigned = true
    }
  })
  return eitherUserHasBeenAssigned
}

const turnPredeterminedPartersIntoPairingsArray = (predeterminedPartnersQueryResponse) => {
  return predeterminedPartnersQueryResponse.reduce((all, item) => {
    // check for existence of either userId in "all"
    // if its in there already, skip, we cant be double assigning

    const eitherUserHasBeenAssigned = checkIfEitherUserHasAlreadyBeenAssigned(
      item.partner_1_id,
      item.partner_2_id,
      all
    )

    if (!eitherUserHasBeenAssigned) {
      all.push([item.partner_1_id, item.partner_2_id])
      return all
    }


    return all
  }, [])
}

export default turnPredeterminedPartersIntoPairingsArray
