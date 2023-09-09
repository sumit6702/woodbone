import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    message:{
        type: String,
        required:true
    },
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const CONTACTQURIES = mongoose.model('ContactQueries',contactSchema);
export default CONTACTQURIES;