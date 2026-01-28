const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();
const { db } = require("./firebaseAdmin");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

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
                throw new Error(`Product not found: ${item.productId}`);
            }

            let itemPrice = product.price;

            // Add extras price
            if (item.extras && Array.isArray(item.extras)) {
                for (const extraName of item.extras) {
                    // Find extra by name (since currently we store names in cart)
                    //Ideally we should store IDs, but for now we match by name or refactor cart to use IDs.
                    // Based on provided types, item.extras is string[].
                    // Let's search in extrasMap values.
                    const extra = Object.values(extrasMap).find(e => e.name === extraName);
                    if (extra) {
                        itemPrice += extra.price;
                    }
                }
            }

            totalAmount += itemPrice * item.quantity;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Convert to cents
            currency: "mxn",
            automatic_payment_methods: { enabled: true },
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
