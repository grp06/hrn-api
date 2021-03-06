"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateInitialPointsArr = (onlineUsers) => {
    const pointsArr = onlineUsers.map((userId) => ({ userId, scores: [] }));
    pointsArr.forEach((userObj) => {
        onlineUsers.forEach((user) => {
            const currentUserId = userObj.userId;
            if (currentUserId !== user) {
                userObj.scores.push({ [user]: 0 });
            }
        });
    });
    return pointsArr;
};
exports.default = generateInitialPointsArr;
//# sourceMappingURL=generateInitialPointsArray.js.map