"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformPairingsToGqlVars = ({ pairings, eventId, round }) => {
    console.log('transformPairingsToGqlVars -> pairings', pairings);
    const variablesArr = [];
    pairings.forEach((pairing) => {
        variablesArr.push({
            user_id: pairing[0],
            partner_id: pairing[1],
            event_id: eventId,
            round,
        });
        if (pairing[1] !== null) {
            variablesArr.push({
                user_id: pairing[1],
                partner_id: pairing[0],
                event_id: eventId,
                round,
            });
        }
    });
    return variablesArr;
};
exports.default = transformPairingsToGqlVars;
//# sourceMappingURL=transformPairingsToGqlVars.js.map