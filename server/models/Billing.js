const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    invoiceNumber: {
        type: String,
        unique: true,
        required: true
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
        category: {
            type: String,
            enum: ['consultation', 'medicine', 'lab', 'procedure', 'other']
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'insurance', 'online'],
        default: null
    },
    paymentDate: Date,
    dueDate: Date,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Generate invoice number before saving
billingSchema.pre('save', async function(next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Billing').countDocuments();
        this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Billing', billingSchema);