const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// helper to create JWT
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, { expiresIn: "1d" });
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.login({ username, password });

        const token = createToken(user._id);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username
            },
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const signupUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(username, password);
        
        if (!username || !password) {
            return res.status(400).json({ message: "All fields must be filled" });
        }

        // check if user already exists
        const exists = await User.findOne({ username });

        if (exists) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        const user = await User.create({ username, password: hashedPassword });

        // create JWT
        const token = createToken(user._id);

        res.status(201).json({
            message: "Signup successful",
            user: {
                id: user._id,
                username: user.username
            },
            token
        });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, signupUser };
