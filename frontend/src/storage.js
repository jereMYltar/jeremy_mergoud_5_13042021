// export function addToCart(product)
// {
//     let model = document.getElementById('model');
//     if (localStorage.getItem(product._id + '_' + model.value)) {
//         if (itemQuantity.value == 0) {
//             localStorage.removeItem(product._id + '_' + model.value);
//         } else {
//             let item = JSON.parse(localStorage.getItem(product._id + '_' + model.value));
//             item.quantity = parseInt(item.quantity, 10) + parseInt(itemQuantity.value, 10);
//             item.totalPrice = item.quantity * item.price;
//             localStorage.setItem(product._id + '_' + model.value, JSON.stringify(item));
//         }
//     } else {
//         let item = {
//             name: product.name,
//             model: model.value,
//             price: product.price,
//             quantity: parseInt(itemQuantity.value, 10),
//             totalPrice: product.price * itemQuantity.value
//         };
//         localStorage.setItem(product._id + '_' + model.value, JSON.stringify(item));
//     }
//     displayCart();
// }

// export function getQuantityInCart(product)
// {
//     let model = document.getElementById('model');
//     if (localStorage.getItem(product._id + '_' + model.value)) {
//         let item = JSON.parse(localStorage.getItem(product._id + '_' + model.value));
//         itemQuantity.value = item.quantity;
//     } else {
//         itemQuantity.value = 0;
//     }
// }

// export function displayCart()
// {
//     let msg = "";
//     if (localStorage.length == 0) {
//         msg = "Votre panier est vide.";
//     } else {
//         msg = "Votre panier comporte :";
//         let totCart = 0;
//         for (let i=0; i<localStorage.length; i++) {
//             let item = JSON.parse(localStorage.getItem(localStorage.key(i)));
//             msg += `\r${item.quantity} peluche(s) ${item.name} de couleur ${item.model}, pour un prix de ${item.totalPrice/100}€`;
//             totCart += item.totalPrice;
//         }
//         msg += `\rMontant total de votre panier : ${totCart/100}€`;
//     }
//     alert(msg);
// }

// export function clearCart (input)
// {
//     localStorage.clear();
//     input.value = 0;
// }

// export function getProductQuantity (product, productModel)
// {
//     let basket = getStorageObject();
//     if (!basket[constructProductId (product, productModel)])
//     {
//         return 0;
//     }
//     else
//     {
//         return basket[constructProductId (product, productModel)]["quantity"];
//     }
// }

export function getProductQuantity (productId, cartObject = getStorageObject())
{
    if (!cartObject[productId])
    {
        return 0;
    }
    else
    {
        return cartObject[productId]["quantity"];
    }
}

export function setProductQuantity (product, productId, productQuantity, productModel, cartObject = getStorageObject())
{
    if (productQuantity == 0)
    {
        delete cartObject[constructProductId(productId, productModel)];
        setStorageObject(cartObject);
    }
    else
    {
        storeProduct(product, productId, productQuantity, productModel);
    }
}

function storeProduct (product, productId, productQuantity, productModel, cartObject = getStorageObject())
{
    cartObject[constructProductId(productId, productModel)] = constructProductObject(product, productQuantity, productModel);
    setStorageObject(cartObject);
}

export function getStorageObject ()
{
    if (!localStorage.getItem("cart"))
    {
        localStorage.setItem("cart", "{}");
    }
    return JSON.parse(localStorage.getItem("cart"));
}

function setStorageObject (cartObject)
{
    localStorage.setItem("cart", JSON.stringify(cartObject));
}

function constructProductObject (product, productQuantity, productModel)
{
    return {
        name : product.name,
        _id : product._id,
        color : productModel,
        imageUrl : product.imageUrl,
        price : product.price,
        quantity : parseInt(productQuantity, 10),
        totalPrice : product.price * productQuantity
    };
}

export function constructProductId (productId, productModel)
{
    if (productModel == "")
    {
        return productId;
    }
    else
    {
        return productId + "_" + productModel.replace(" ", "_");
    }
}
