const cors = require("cors")
const express = require("express")
const stripe = require("stripe")("Replace this with your stripe public key")
const { v4: uuidv4 } = require('uuid');


const app = express()

//middlewares
app.use(express.json())
app.use(cors())

//routes
app.get("/", (req, res) => {
    res.send("It works on machine")
})

app.post('/payment', (req, res) => {
    const { product, token } = req.body
    console.log("product", product)
    console.log("price", product.price)
    const idempotencyKey = uuidv4() //fired at only once.. user wont be charged twice for same product. 

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchase of product.name`,
            shipping: {
                name: token.card.name,
                address: {
                    country : token.card.address_country
                }
            }
        }, {idempotencyKey})
    }).then(result => res.status(200).json(result)).catch(err => console.log(err))

})


//listen
app.listen(8282, () => console.log("App listening at port 8282"))