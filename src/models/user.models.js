import mongoose , {Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    username : {
        type : String,
        required :true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required :true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    fullname:{
        type : String,
        required :true,
        trim : true,
        index : true
    },
    avatar : {
        type : String, //cloudinary url
        required :true,
    },
    coverImage : {
        type : String, //cloudinary url
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Video'
        }
    ],
    password : {
        type: String,
        required : [true , 'Password is required'] 
    },
    refreshToken : {
        type : String ,
    },
},  {timestamps : true})


// mongoose methosd or hooks

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password ,12) 
    next()    
})

userSchema.methods.isPasswordCorret = async function (password) {
    return await bcrypt.compare(password , this.password)
}


userSchema.methods.generateAccessToken = function () {
    // sort live access token jwt token
    return jwt.sign({_id : this._id , email : this.email , username :this.username , fullname : this.fullname} ,process.env.ACCESS_tOKEN_SECRET, {expiresIn : process.env.ACCESS_tOKEN_EXPIRY})
    
}



userSchema.methods.generateRefreshToken = function () {
    // sort live access token jwt token
    return jwt.sign({
        _id : this._id 
        } ,
        process.env.REFRESH_tOKEN_SECRET,
         {expiresIn : process.env.REFRESH_tOKEN_EXPIRY})
    
}

export const User = mongoose.model("User" ,userSchema)