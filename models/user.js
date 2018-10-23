const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const saltRounds = 10;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.methods.genHash = function (password, cb) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return cb(err);

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) return cb(err);
            return cb(null, hash);
        });
    });
};

userSchema.pre('save', function(next) {
   if(!this.isModified('password')) return next();

   this.genHash(this.password, (err, hash) => {
       if(err) return next(err);
       this.password = hash;
       next();
    })
});

userSchema.methods.comparePassword = function(password, cb) {

    bcrypt.compare(password, this.password, (err, isMatch) => {
        if(err) return cb(err);
        cb(null, isMatch);
    })
};

const User = mongoose.model('User', userSchema);

module.exports = User;