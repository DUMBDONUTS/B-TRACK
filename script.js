const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

const localStorageTransactions = JSON.parse(
    localStorage.getItem("transactions")
);

let transactions =
    localStorage.getItem("transactions") !== null
        ? localStorageTransactions
        : [];

// Add Transactions
function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === "" || amount.value.trim() === "") {
        alert("Please add a expense and amount");
    } else {
        const transaction = {
            id: generateId(),
            text: text.value,
            amount: +amount.value,
        };

        transactions.push(transaction);

        addTransactionToDOM(transaction);

        updateLocalStoarge();

        updateValues();

        text.value = "";
        amount.value = "";
    }
}

// Add Transactions To The DOM List
function addTransactionToDOM(transaction) {
    // Get the sign plus or minus
    const sign = transaction.amount < 0 ? "-" : "+";
    const item = document.createElement("li");

    // Add classes based on the value
    item.classList.add(transaction.amount < 0 ? "minus" : "plus");
    item.innerHTML = `
        ${transaction.text} <span>${sign}${Math.abs(
        transaction.amount
    )}</span> <button class="delete-btn" onClick="removeTransaction(${
        transaction.id
    })">x</button>
    `;
    list.appendChild(item);
}

// Update the balance, income and expenses
function updateValues() {
    const amounts = transactions.map((transaction) => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter((item) => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (
        amounts
            .filter((item) => item < 0)
            .reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balance.innerText = `${total}`;
    money_plus.innerText = `$${income}`;
    money_minus.innerText = `$${expense}`;
}

// Delete The Transactions by ID
function removeTransaction(id) {
    transactions = transactions.filter((transaction) => transaction.id !== id);

    updateLocalStoarge();

    init();
}

// Update The Local Storage
function updateLocalStoarge() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Initialize the App
function init() {
    list.innerHTML = "";

    transactions.forEach(addTransactionToDOM);
    updateValues();
}

init();

// Generate a Random ID
function generateId() {
    return Math.floor(Math.random() * 100000000);
}

form.addEventListener("submit", addTransaction);

// login

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

// Register Route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.json({ message: "User registered successfully" });
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Protected Route (Dashboard)
app.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome to B-Track Dashboard!" });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
