const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    profileImageURL: {
        type: String,
        default: "/images/default.png",
    },

}, { timestamps: true });


// ======================
// HASH PASSWORD BEFORE SAVE
// ======================
userSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});


// ======================
// PASSWORD COMPARISON METHOD
// ======================
userSchema.methods.comparePassword = async function (enteredPassword) {

    return await bcrypt.compare(enteredPassword, this.password);

};

const User = mongoose.model("user", userSchema);

module.exports = User;
