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
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const book = await Book.create({ args })

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { books: book } },
                    { new: true }
                );

                return book;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, args) => {
            if (context.user) {
                const removeBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );
                return removeBook;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
}

module.exports = resolvers