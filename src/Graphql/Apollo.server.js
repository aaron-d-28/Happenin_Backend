import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone"
import {Program}  from "../models/Program.model.js"
import {ApiError} from "../utils/ApiError.js"
//types
import {typeDefs} from "../models/Graphql.user.model.js"
import { resolvers}from  "../models/Graphql.resolvers.js"

export const Apollo=async()=>
{
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })

    const {url} = await startStandaloneServer(server, {listen: {port: 3001}})

    console.log(" apollo Server running on port 3001 ")
}