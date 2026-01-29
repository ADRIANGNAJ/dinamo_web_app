require("dotenv").config();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const accountId = process.env.STRIPE_CONNECT_ACCOUNT_ID;

async function checkAccount() {
    console.log("Checking account:", accountId);
    try {
        const account = await stripe.accounts.retrieve(accountId);
        console.log("Account Capabilities:", JSON.stringify(account.capabilities, null, 2));
        console.log("Account Type:", account.type);
        console.log("Payouts Enabled:", account.payouts_enabled);
        console.log("Charges Enabled:", account.charges_enabled);
    } catch (error) {
        console.error("Error fetching account:", error.message);
    }
}

checkAccount();
