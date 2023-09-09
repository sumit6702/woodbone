import mongoose from "mongoose";
import moment from "moment";

const LoginattemptSchema = new mongoose.Schema({
    email:{
        type: String,
        required:true
    },
    ipAddress: {
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true,
    },
    result:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default: Date.now,
    },
})

const LOGINATTEMPT = mongoose.model('AdminLogins',LoginattemptSchema);
export default LOGINATTEMPT;