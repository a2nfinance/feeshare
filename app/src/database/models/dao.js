import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let dao = new Schema({
    creator: {
        type: String,
        require: true
    },
    dao_address: {
        type: String,
        require: true
    },
    treasury_address: {
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
let DAO = mongoose.model('DAO', dao);
mongoose.models = {};
export default DAO;