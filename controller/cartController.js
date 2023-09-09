import USERREGISTERMODEL from "../model/UserAccount.js";
import PRODUCTS from "../model/productSchema.js";
import USERDATA from "../model/UserDataSchema.js";

const cartController = async (req, res) => {
    try {
        const user = req.session.user_id;
        let cartData = [];
        req.session.redirectPage = req.originalUrl;
        if (user) {
            const userdata = await USERDATA.findOne({ user: user });
            if (userdata) {
                cartData = userdata.cart || [];
            }
        } else {
            cartData = req.session.cart || [];
        }

        const productIds = cartData.map((item) => item.productId);

        const products = await PRODUCTS.find({ productId: { $in: productIds } });
        function getQuantityForProduct(cartData, productId) {
            const item = cartData.find(item => item.productId === productId);
            return item ? item.quantity : 0;
        }
        res.render("cart", {
            userid: req.user, cartval:req.cartval,
            products,
            cartData,
            getQuantityForProduct,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
};

const addtoCartController = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.params.quantity);
        const user = req.session.user_id;

        const maxQuantity = 4;
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            quantity = 1;
        } else if (quantity > maxQuantity) {
            quantity = maxQuantity;
        }

        const product = await PRODUCTS.findOne({ productId: productId });
        if (!product) {
            res.status(404).send("Product not found");
            return;
        }

        if (user) {
            const userdata = await USERDATA.findOne({ user: user });
            if (userdata) {
                const existingCartItem = userdata.cart.find(item => item.productId === productId);

                if (existingCartItem) {
                    if (existingCartItem.quantity + quantity > maxQuantity) {
                        existingCartItem.quantity = maxQuantity;
                    } else {
                        existingCartItem.quantity += quantity;
                    }
                } else {
                    userdata.cart.push({ productId: productId, quantity: quantity });
                }

                await userdata.save();
            } else {
                const newUserdata = new USERDATA({
                    userid: user,
                    cart: [{ productId: productId, quantity: quantity }]
                });
                await newUserdata.save();
            }
        } else {
            req.session.cart = req.session.cart || [];
            const existingCartItem = req.session.cart.find((item) => item.productId === product.productId);

            if (existingCartItem) {
                if (existingCartItem.quantity + quantity > maxQuantity) {
                    existingCartItem.quantity = maxQuantity;
                } else {
                    existingCartItem.quantity += quantity;
                }
            } else {
                if (quantity > maxQuantity) {
                    quantity = maxQuantity;
                }
                req.session.cart.push({ productId: product.productId, quantity: quantity });
            }
        }

        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
};

const updateCartController = async (req, res) => {
    try {
        const productId = req.params.productId;
        let quantity = parseInt(req.body.quantity);
        const user = req.session.user_id;

        const maxQuantity = 4;
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            quantity = 1;
        } else if (quantity > maxQuantity) {
            quantity = maxQuantity;
        }

        const product = await PRODUCTS.findOne({ productId: productId }) || null;

        if (!product) {
            res.status(404).send("Product not found");
            return;
        }

        if (user) {
            const userdata = await USERDATA.findOne({ user: user });

            if (userdata) {
                const existingCartItem = userdata.cart.find(item => item.productId === productId);

                if (existingCartItem) {
                    existingCartItem.quantity = quantity;
                    await userdata.save();
                }
            }
        } else {
            req.session.cart = req.session.cart || [];
            const existingCartItem = req.session.cart.find(item => item.productId === product.productId);

            if (existingCartItem) {
                existingCartItem.quantity = quantity;
            }
        }

        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
};

const removeCartItemController = async (req, res) => {
    try {
        const productId = req.params.productId;
        const user = req.session.user_id;

        if (user) {
            const userdata = await USERDATA.findOne({ user: user });

            if (userdata) {
                const index = userdata.cart.findIndex(item => item.productId === productId);

                if (index !== -1) {
                    userdata.cart.splice(index, 1);
                    await userdata.save();
                    res.redirect("/cart");
                } else {
                    res.status(404).send("Item not found in the user's cart");
                }
            } else {
                res.status(404).send("User data not found");
            }
        } else {
            req.session.cart = req.session.cart || [];

            const index = req.session.cart.findIndex(item => item.productId === productId);

            if (index !== -1) {
                req.session.cart.splice(index, 1);
                res.redirect("/cart");
            } else {
                res.status(404).send("Item not found in the session cart");
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
};


const wishlistcontroller = async (req, res) => {
    const userid = await USERREGISTERMODEL.findOne({ _id: req.session.user_id });
    const userdata = await USERDATA.findOne({ user: userid._id });
    const wishlistItemIds = userdata.wishlist;
    const products = await PRODUCTS.find({ productId: { $in: wishlistItemIds } });
    req.session.redirectPage = req.originalUrl;
    res.render("wishlist", { userid: req.user, cartval:req.cartval, userdata, products });
};

const addwishlistController = async (req, res) => {
    try {
        const productId = req.params.productId;
        const user = req.session.user_id;

        const userdata = await USERDATA.findOne({ user: user });

        if (userdata) {
            const wishlistArray = userdata.wishlist;
            const exists = wishlistArray.includes(productId);

            if (exists) {
                res.redirect('/wishlist')
            } else {
                // Push the new productId to the wishlist array
                userdata.wishlist.push(productId);
                await userdata.save();
            }
        } else {
            // If userdata is not found, create a new entry with the wishlist
            const newUserdata = new USERDATA({
                userid: user,
                wishlist: [productId]
            });
            await newUserdata.save();
        }
        res.redirect('/wishlist');

    } catch (error) {
        console.log(error.message);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
};


const removewishlistController = async (req, res) => {
    try {
        const productId = req.params.productId;
        const user = req.session.user_id;

        const userdata = await USERDATA.findOne({ user: user });

        if (userdata) {
            const wishlistArray = userdata.wishlist;

            const productIndex = wishlistArray.indexOf(productId);

            if (productIndex !== -1) {
                wishlistArray.splice(productIndex, 1);

                userdata.wishlist = wishlistArray;

                await userdata.save();
            } else {
            }
        } else {
            console.log('User data not found');
        }

        res.redirect('/wishlist');

    } catch (error) {
        console.log(error.message);
        res.status(500).send("<h2>Internal Server Error</h2>");
    }
};


export { cartController, addtoCartController, updateCartController, removeCartItemController, wishlistcontroller, removewishlistController, addwishlistController };
