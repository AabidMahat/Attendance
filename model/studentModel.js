const crypto = require('crypto');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
//createing the Schema

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must enter the name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'User must enter the email'],
        trim: true,
        unique: true,
        toLowerCase: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        unique: true,
        required: [true, 'User must enter the Password'],
        trim: true,
        minLength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        require: [true, 'User must enter the password'],
        minLength: 8,

        //Validator will only work on save and create query
        validate: {
            validator: function (pass) {
                return pass === this.password;
            },
            message: 'Password are not same !! Check the password😉',
        },
    },
    passwordChangeAt: Date,
    verificationToken: {
        type: String,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    subject: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Subject',
        },
    ],
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
});

//Encryption of password
studentSchema.pre('save', async function (next) {
    //Only run this function if password is actually modified

    if (!this.isModified('password')) return next();

    //hash the password using bcrypt
    this.password = await bcrypt.hash(this.password, 14);

    //Don't save confirmPassword into database
    this.confirmPassword = undefined;
    next();
});

//Updating passwordChangeAt
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000;

    next();
});

//This is the instance method so it is applicable to all documents in this Schema
studentSchema.methods.correctPassword = async function (
    newPassword,
    currentPassword
) {
    return await bcrypt.compare(newPassword, currentPassword);
};

studentSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangeAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10
        );
        console.log(changedTimeStamp, JWTTimeStamp);
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

studentSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    //encrypting token
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);
    //Expires timer
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
