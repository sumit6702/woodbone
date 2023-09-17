import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    order_id:{
        type:String,
        required:true,
        unique: true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'USERREGISTERMODEL',
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    phoneno:{
        type:Number,
        required:true,
    },
    ShippingAddress:{
        type:String,
        required:true
    },
    BillingAddress:{
        type:String,
    },
    orderprice:{
        type:Number,
        required:true
    },
    products:[
        {
            product_id:{
                type:String,
                required:true,
            },
            productname:{
                type:String,
                required:true,
            },
            ProductQuantity:{
                type:Number,
                required:true
            },
            productPrices:{
                type:Number,
                required:true
            },
        }
    ],
    Orderstatus:{
        type:String,
        enum: ["orderd", "packed & ready","shipped", "deliverd","cancellation initiated", "cancellation approved","cancellation rejected", "cancelled"],
        default:"orderd"
    },
    description:{
        type:String
    },
    PaymentInformation:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
})

const ORDERS = mongoose.model('Orders',OrderSchema);
export default ORDERS;