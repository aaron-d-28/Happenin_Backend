export const typeDefs = `#graphql
#graphql
type Admin {
    id: ID!
    name: String!
    email: String!
    password: String!
    appointedschedulerid: [ID!]
    refreshToken: String
}

type Employee {
    id: ID!
    name: String!
    email: String!
    Schedulerid: ID
    password: String!
    empimg: String!
    refreshToken: String
}

type Scheduler {
    id: ID!
    type: Type!
    name: String!
    commission: Int!
    authorizerid: ID!
    password: String!
    email: String!
    refreshtoken: String
}

type User {
    id: ID!
    username: String!
    userimage: String
    fullname: String!
    gender: Gender!
    email: String!
    phone: String!
    user_location: String!
    events_visited: [ID!]
    DOB: String
    password: String!
    refreshToken: String
}

enum Gender {
    Male
    Female
    Others
}

type Program {
    id: ID!
    type: Type!
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
enum Type {
    Govt
    Public
    Business
    Test
}



type Query {
    getPrograms: [Program!]!
    getProgramtype(type: Type!): Program
    getProgramsuburb(suburb: String!): Program
    getProgramstate(state: String!): Program
    getProgramprice(price: Float!): Program
    
    getAdmins: [Admin!]!
    getEmployees: [Employee!]!
    getSchedulers: [Scheduler!]!
    getUsers: [User!]!
    
#    getUserby
}

`