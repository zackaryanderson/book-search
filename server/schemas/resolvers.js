const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ id: context.user._id })
                .select('-__v')
                .populate('savedBooks')

                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    // Mutation: {

    // }
}

module.exports = resolvers