import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let proposal = new Schema({
    creator: {
        type: String,
        require: true
    },
    onchain_id: {
        type: Number,
        require: true
    },
    dao_id: {
        type: String,
        require: true
    },
    duration_in_days: {
        type: Number,
        require: true
    },
    proposal_type: {
        type: String, // incentive, sendfund, custom, etc
        require: true
    },
    dao_address: {
        type: String,
        require: true
    },
    params: {
        type: Object,
        require: true
    },
    status: {
        type: String,
        require: true,
        default: "active"
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});
let Proposal = mongoose.model('Proposal', proposal);
mongoose.models = {};
export default Proposal;