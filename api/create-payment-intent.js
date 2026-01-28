const Stripe = require("stripe");
const { db } = require("./firebaseAdmin");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

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
                // Return immediately if product not found, instead of throwing which might crash the function
                return res.status(400).json({ error: `Product not found: ${item.productId}` });
            }

            let itemPrice = product.price;

            // Add extras price
            if (item.extras && Array.isArray(item.extras)) {
                for (const extraName of item.extras) {
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

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: error.message });
    }
};
