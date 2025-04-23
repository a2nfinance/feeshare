import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let app = new Schema({
    creator: {
        type: String,
        require: true
    },
    onchain_app_id: {
        type: Number,
        require: true,
    },
    reward_address: {
        type: String,
        require: true
    },
    application_name: {
        type: String,
        require: true
    },
    program_address: {
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
let App = mongoose.model('App', app);
mongoose.models = {};
export default App;