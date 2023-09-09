import mongoose from "mongoose";

const prodComment = new mongoose.Schema({
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'PRODUCTS',
        required:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'USERREGISTERMODEL',
        required:true
    },
    user:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
        required:true,
    },
    comment:{
        type:String,
        required:true,
    },
    upvotes:{
        type:Number,
        default:0,
    },
    timestamp:{
        type:Date,
        default:Date.now(),
    }
});

const PRODCOMMENTS = mongoose.model('ProductComments',prodComment);
export default PRODCOMMENTS;