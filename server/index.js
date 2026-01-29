const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();
const { db } = require("./firebaseAdmin");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Stripe server is running!");
});

app.post("/create-payment-intent", async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "No items provided" });
        }

        let totalAmount = 0;

        // Fetch all products from Firestore
        const productsSnapshot = await db.collection("products").get();
        const productsMap = {};
        productsSnapshot.forEach(doc => {
            productsMap[doc.id] = doc.data();
        });

        // Fetch all extras from Firestore
        const extrasSnapshot = await db.collection("extras").get();
        const extrasMap = {};
        extrasSnapshot.forEach(doc => {
            extrasMap[doc.id] = doc.data();
        });

        // Calculate total
        for (const item of items) {
            const product = productsMap[item.productId];
            if (!product) {
                console.error(`Product ID not found: ${item.productId}`);
                throw new Error(`Product not found: ${item.productId}`);
            }

            let itemPrice = Number(product.price || 0);
            if (isNaN(itemPrice)) {
                console.error(`Invalid product price for ${product.name}: ${product.price}`);
                throw new Error(`Invalid price for product: ${product.name}`);
            }

            // Add extras price
            if (item.extras && Array.isArray(item.extras)) {
                for (const extraName of item.extras) {
                    const extra = Object.values(extrasMap).find(e => e.name === extraName);
                    if (extra) {
                        const extraPrice = Number(extra.price || 0);
                        if (isNaN(extraPrice)) {
                            console.error(`Invalid extra price for ${extraName}: ${extra.price}`);
                        } else {
                            itemPrice += extraPrice;
                        }
                    } else {
                        console.warn(`Extra not found in DB: ${extraName}`);
                    }
                }
            }

            if (isNaN(itemPrice)) {
                throw new Error(`Calculated price is NaN for item: ${item.productId}`);
            }

            console.log(`Item: ${product.name}, Price: ${itemPrice}, Qty: ${item.quantity}`);
            totalAmount += itemPrice * item.quantity;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Convert to cents
            currency: "mxn",
            automatic_payment_methods: { enabled: true },
        }, {
            stripeAccount: process.env.STRIPE_CONNECT_ACCOUNT_ID,
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(4242, () => {
    console.log("Stripe server running on port 4242");
});
