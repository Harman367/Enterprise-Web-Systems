//Imports
import { model, Schema } from "mongoose";
import crypto from "crypto";

//Create Schema
const userSchema = new Schema({
    "firstName": { type: String, required: true },
    "lastName": { type: String, required: true },
    "email": { type: String, required: true, unique: true },
    "company": { type: String, required: true },
    "username": { type: String, required: true, unique: true },
    "hashed_password": { type: String, required: true },
    "salt": { type: String, required: true },
    "admin": { type: Boolean, default: false },
    "savedQuotes": [{ type: Schema.Types.ObjectId, ref: "Quote" }]
});

//Hash password
userSchema.virtual("password").set(function (password){
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
}).get(function () {
    return this._password
})

//User Schema Methods
userSchema.methods = {
    //Authenticate user
    authenticate: function (plainText){
        return this.encryptPassword(plainText) === this.hashed_password
    },
    encryptPassword: function (password){
        if(!password){
            return ""
        }
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (err) {
            return '' 
        }
    },
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + ""
    }
}

//User validation
userSchema.path('hashed_password').validate(function(v) {
    //Check password length.
    if (this._password && this._password.length < 8){
        this.invalidate('password', 'Password must be at least 8 characters.')    
    }

    //Check if password is empty.
    if (this.isNew && !this._password) {
        this.invalidate('password', 'Password is required')
    }    
}, null)

//Create model
const userModel = model("User", userSchema);
export default userModel;