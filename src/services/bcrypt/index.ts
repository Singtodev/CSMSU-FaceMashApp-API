const bcrypt = require('bcrypt');

const saltRounds = 10;

// Function to hash a password
const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw error;
  }
};

// Function to compare a password with a hash
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    throw error;
  }
};



export default {
    comparePassword ,
    hashPassword
}