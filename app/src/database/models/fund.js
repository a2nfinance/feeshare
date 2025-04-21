import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let fund = new Schema({
    creator: {
        type: String,
        require: true
    },
    dao_id: {
        type: String,
        require: true
    },
    dao_address: {
        type: String,
        require: true
    },
    proposal_id: {
        type: String,
        require: true
    },
    params: {
        type: Object,
        require: true
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});
let Fund = mongoose.model('Fund', fund);
mongoose.models = {};
export default Fund;