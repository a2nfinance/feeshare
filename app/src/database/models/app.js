import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let app = new Schema({
    creator: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    program_address: {
        type: String,
        require: true
    },
    reward_address: {
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
let App = mongoose.model('Program', app);
mongoose.models = {};
export default App;