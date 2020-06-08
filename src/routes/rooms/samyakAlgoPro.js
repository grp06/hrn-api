const grabExistingData = (userIds, prevAssignments) => {
  // const map = JSON.parse(allAssignments)
  const map = JSON.parse(JSON.stringify(prevAssignments))
  userIds.forEach((id) => {
    if (!map[id]) {
      map[id] = []
    }
  })
  return map
}
const initialUserIdsMap = (userIds) => {
  return userIds.reduce((all, item, index) => {
    all[item] = []
    return all
  }, {})
}
// Shuffling main array to increase probability of mathcing with less runtime.
const shuffle = (array) => {
  const arr = array
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
const mainFunction = (mainNULL, upperBound, userIdsMap, finalArray, copyOfUserIds) => {
  // let finalArrayCopy = [...finalArray]
  const userIdsMapCopy = JSON.parse(JSON.stringify(userIdsMap))
  while (mainNULL > 1 && upperBound < 100) {
    const doubleCopy = copyOfUserIds.slice()
    const shuffledArray = shuffle(doubleCopy)
    const tempOutput = mainPairing(shuffledArray, userIdsMapCopy)
    const localArray = tempOutput.mainArray
    const localCount = tempOutput.countNULL
    if (localCount < mainNULL) {
      mainNULL = localCount
      finalArray = localArray
    }
    upperBound++
  }
  return finalArray
}
// Function that pairs the elements from the input array.
function mainPairing(initialInput, userIdsMap) {
  const tempArray = []
  let tempNULL = 0
  while (initialInput.length > 0) {
    const player1 = initialInput[0]
    const playerMatch = userIdsMap[player1]
    let i = 1
    while (playerMatch.includes(initialInput[i])) {
      i++
      if (i > initialInput.length - 1) {
        break
      }
    }
    if (i > initialInput.length - 1) {
      tempArray.push([player1, null])
      tempNULL++
    } else {
      const player2 = initialInput[i]
      tempArray.push([player2, player1])
      tempArray.push([player1, player2])
      initialInput.splice(i, 1)
    }
    initialInput.splice(0, 1)
  }
  return {
    mainArray: tempArray,
    countNULL: tempNULL,
  }
}
// Each element of the main array is an array of 2 elements
// Element at index 0 represents UserID
// Element at index 1 represents PartneerID / NULL
const finalMatch = (array, userIdsMap) => {
  const arrayCopy = [...array]
  const finalUserIdsMap = JSON.parse(JSON.stringify(userIdsMap))
  while (arrayCopy.length > 0) {
    const temp1 = arrayCopy[0]
    const player = temp1[0]
    const playerP = temp1[1]
    const playerMatch = finalUserIdsMap[player]
    playerMatch.pop()
    playerMatch.push(playerP)
    finalUserIdsMap[player] = playerMatch
    arrayCopy.splice(0, 1)
  }
  return finalUserIdsMap
}
function SamyakAlgoPro(userIds, prevAssignments) {
  const numRounds = userIds.length - 1
  const firstRun = !prevAssignments
  const userIdsMap = firstRun
    ? initialUserIdsMap(userIds)
    : grabExistingData(userIds, prevAssignments)
  // ----------- Pair off User Ids -----------
  const copyOfUserIds = [...userIds]
  let arrLength = 0
  const values = Object.values(userIdsMap)
  // For marking postitions when the user was offline
  // OUO - Old User Offline
  for (const value of values) {
    if (arrLength < value.length) {
      arrLength = value.length
    }
    value.push(0)
  }
  // For marking previous postions of a new user.
  // DNP - Did Not Participate
  for (const value of values) {
    const tempLength = value.length
    for (let i = 0; i < arrLength - tempLength + 1; i++) {
      value.unshift(0)
    }
  }
  let finalArray = []
  // Counter to keep track of the best Pairs possible.
  const mainNULL = copyOfUserIds.length
  // Counter to keep an upper bound on runtime.
  const upperBound = 0
  finalArray = mainFunction(mainNULL, upperBound, userIdsMap, finalArray, copyOfUserIds)
  // Extra safety check to ensure definite pairing when possible.
  if (mainNULL == copyOfUserIds.length) {
    let tempCount = 0
    while (tempCount < 2) {
      finalArray = mainFunction(mainNULL, upperBound, userIdsMap, finalArray, copyOfUserIds)
      tempCount++
    }
  }
  // When no possible pairs can be formed. aka. Event over.
  if (mainNULL == copyOfUserIds.length) {
    for (const value of values) {
      value.splice(value.length - 1, 1, null)
    }
  }
  const finalUserIdsMap = finalMatch(finalArray, userIdsMap)
  // this function is to filter out the duplicate rounds

  const newArr = []

  finalArray.forEach((item, idx) => {
    item.sort()
    if (JSON.stringify(newArr).indexOf(JSON.stringify(item)) === -1) {
      newArr.push(item)
    }
  })
  return { newPairings: finalArray, userIdsMap: finalUserIdsMap }
}
export default SamyakAlgoPro
