import mongoose from "mongoose";

const userTokenSchmea = new mongoose.Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
})

const USERTOKEN = mongoose.model('userTokens', userTokenSchmea);
export default USERTOKEN;