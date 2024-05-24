const
    express = require('express'),
    app = express(),
    port = 3001,
    body_parser = require('body-parser')
    db = require('./core/db')

app.use( body_parser.urlencoded({ extended: true }) )
app.use( body_parser.json() )

let response = {
    status: "error",
    message: "Something went wrong!"
}

app.get("/products", (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if( err ) throw err
        return res.status(200).json( results )
    })
})

app.post( "/product/add", (req, res) => {
    const
        barcode = req.body.barcode,
        name = req.body.name,
        price_piece = req.body.price_piece,
        price_pack = req.body.price_pack

    db.query( "SELECT id FROM products WHERE ?", { barcode }, (err, rows) => {
        if( err ) throw err

        if( rows && rows.length ) {
            response.message = "Barcode already exists"
            return res.status(500).json( response )
        }

        db.query("INSERT INTO products SET ?", { barcode, name }, ( err, result ) => {
            if( err ) throw err

            if( !result.insertId ) {
                response.message = "Product cannot be added"
                return res.status(500).json( response )
            }

            if( price_piece )
                db.query("INSERT INTO prices SET ?", { product_id: result.insertId, price: price_piece, type: "piece" })

            if( price_pack )
                db.query("INSERT INTO prices SET ?", { product_id: result.insertId, price: price_pack, type: "pack" })

            response.status = "success"
            response.message = "Product Added"

            return res.status(200).json( response )
        })
    } )

} )

app.get("/product/:barcode", (req, res) => {
    const barcode = req.params.barcode

    db.query("SELECT products.id, products.name, products.barcode, products.date_added, MAX(prices.price) as price FROM products LEFT JOIN prices ON products.id = prices.product_id WHERE ? LIMIT 1", { barcode }, (err, results) => {
        if( err ) throw err

        if( results && !results[0].id ) {
            response.message = "No product found!"
            return res.status(500).json( response )
        }

        return res.status(200).json( results[0] )
    })
})

app.post("/product/:barcode/update_price", (req, res) => {
    const
        barcode = req.params.barcode,
        price = parseFloat( req.query.price ),
        type = req.query.type ?? "piece"

    db.query("SELECT id FROM products WHERE ? LIMIT 1", { barcode }, (err, product) => {
        if( err ) throw err

        db.query("INSERT INTO prices SET ?", { product_id: product[0].id, price, type }, (err, result) => {
            if( err ) throw err

            response.status = "success"
            response.message = "Price Updated"

            return res.status(200).json( response )
        })
    })
})

app.listen( port, () => {
    console.log( `Alfabeth server is running on port ${port}` )
} )