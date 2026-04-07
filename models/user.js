const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
    },

    profileImageURL: {
        type: String,
        default: "/images/default.svg",
    },

},
{ timestamps: true }
);


// ======================
// HASH PASSWORD BEFORE SAVE
// ======================
userSchema.pre("save", async function (next) {

    try {

        // only hash if password changed
        if (!this.isModified("password")) return next();

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        next();

    } catch (err) {
        next(err);
    }
});


// ======================
// PASSWORD COMPARISON
// ======================
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};


// ======================
// SAFE JSON OUTPUT (hide password)
// ======================
userSchema.methods.toJSON = function () {

    const obj = this.toObject();
    delete obj.password;
    return obj;

};


const User = mongoose.model("user", userSchema);

module.exports = User;