import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'USERREGISTERMODEL',
        required:true
  },
    order_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ORDERS',
        required:true
    },
    invoice: Object,
    createdDate: {
      type: Date,
      default: Date.now,
    },
})

const INVOICE = mongoose.model('Invoices', InvoiceSchema);
export default INVOICE;