"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatError = (error) => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
        .replace('SequelizeValidationError: ', '')
        .replace('Validation error: ', '');
    return Object.assign(Object.assign({}, error), { message });
};
exports.default = formatError;
//# sourceMappingURL=formatError.js.map