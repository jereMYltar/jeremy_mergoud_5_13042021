export function addToCart(product)
{
    let model = document.getElementById('model');
    if (localStorage.getItem(product._id + '_' + model.value)) {
        if (itemQuantity.value == 0) {
            localStorage.removeItem(product._id + '_' + model.value);
        } else {
            let item = JSON.parse(localStorage.getItem(product._id + '_' + model.value));
            item.quantity = parseInt(item.quantity, 10) + parseInt(itemQuantity.value, 10);
            item.totalPrice = item.quantity * item.price;
            localStorage.setItem(product._id + '_' + model.value, JSON.stringify(item));
        }
    } else {
        let item = {
            name: product.name,
            model: model.value,
            price: product.price,
            quantity: parseInt(itemQuantity.value, 10),
            totalPrice: product.price * itemQuantity.value
        };
        localStorage.setItem(product._id + '_' + model.value, JSON.stringify(item));
    }
    displayCart();
}

export function getQuantityInCart(product)
{
    let model = document.getElementById('model');
    if (localStorage.getItem(product._id + '_' + model.value)) {
        let item = JSON.parse(localStorage.getItem(product._id + '_' + model.value));
        itemQuantity.value = item.quantity;
    } else {
        itemQuantity.value = 0;
    }
}

export function displayCart()
{
    let msg = "";
    if (localStorage.length == 0) {
        msg = "Votre panier est vide.";
    } else {
        msg = "Votre panier comporte :";
        let totCart = 0;
        for (let i=0; i<localStorage.length; i++) {
            let item = JSON.parse(localStorage.getItem(localStorage.key(i)));
            msg += `\r${item.quantity} peluche(s) ${item.name} de couleur ${item.model}, pour un prix de ${item.totalPrice/100}€`;
            totCart += item.totalPrice;
        }
        msg += `\rMontant total de votre panier : ${totCart/100}€`;
    }
    alert(msg);
}



export function storeProduct (product, productQuantity, productColor)
{
    let basket = getStorageObject();
    basket[setProductId (product, document.getElementById('model').value)] = setProductObject (product, productQuantity, productColor);
    setStorageObject(basket);
}

function getStorageObject ()
{
    if (!localStorage.getItem("cart"))
    {
        localStorage.setItem("cart", "{}");
    }
    return JSON.parse(localStorage.getItem("cart"));
}

function setStorageObject (storageObject)
{
    localStorage.setItem("cart", JSON.stringify(storageObject));
}

function getProductObject (productId)
{
   return getStorageObject()[productId];
}

function setProductObject (product, productQuantity, productColor)
{
    return {
        name : product.name,
        id : product._id,
        color : productColor,
        price : product.price,
        quantity : parseInt(productQuantity, 10),
        totalPrice : product.price * productQuantity
    };
}

function setProductId (product, model)
{
    return product._id + "_" + model.replace(" ", "_");
}

function removeProductStored (key)
{
    delete getStorageObject()[key];
}
