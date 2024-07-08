const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  designation: {
    type: String,
    enum: ["Principal", "Coordinator", "Lecturer"],
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

teacherSchema.pre("save", async function (next) {
  const teacher = this;

  //Hash the password only if it has been modified (or is new)
  if (!teacher.isModified("password")) return next();

  try {
    //hash password generation
    const salt = await bcrypt.genSalt(10);

    //hash password
    const hashedPassword = await bcrypt.hash(teacher.password, salt);
    console.log("Hashed Password during signup:", hashedPassword);

    //Override the plain password with the hashed one
    teacher.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

teacherSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    //use bcrypt to compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(
      `Comparing passwords: Candidate: ${candidatePassword}, Stored: ${this.password}, Match: ${isMatch}`
    );
    return isMatch;
  } catch (error) {
    throw error;
  }
};

/*

hash working mechanism

correctPassword ---------> jskghjsghsohn23r5kdnf
login -----------> incorrectPassword

jskghjsghsohn23r5kdnf ----------? extract all salt
salt+incorrectPassword ------------> hash ------> 2hfuegr5grhsd9ff

compare the hashed password now
*/

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
