import mongoose , {Schema} from 'mongoose'

const subscriptionSchema = new Schema({

    subscription : {
        type : Schema.Types.ObjectId, // one who is subscring
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId, // one to whom "subscription"  is subscribing
        ref : "User"
    }
} , {timestamps : true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)