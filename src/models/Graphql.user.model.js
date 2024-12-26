export const typeDefs = `#graphql
type Program {
    id: ID!
    type: ProgramType!
    programAuthorizerid: ID
    pincode: String!
    location_suburb: String!
    location_city: String!
    location_state: String!
    direction: String!
    current_users: Int
    total_users: Int
    price: Float!
    description: String!
    img_src: [String!]!
}

enum ProgramType {
    Govt
    Business
    Public
    Test 
}
type Query {
    getPrograms: [Program!]!
    getProgramid(id: ID!): Program
    getProgramtype(type:ProgramType!): Program
    getProgramsuburb(suburb:String!): Program 
    getProgramstate(state:String!): Program
    getProgramprice(price:Float!): Program
}
`