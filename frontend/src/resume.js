import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {getQuantity, displayCartCount, hide} from './utils.js';
import {Storage} from './storage.js';

let storage = new Storage();
let myCommand = {
    contact : storage.get("contact"),
    products : Object.keys(storage.get("cart"))
};

fetch('http://localhost:3000/api/teddies/order',
{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify(myCommand)
})

.then((res) => 
{
    return res.json();
})
.then((products) =>
{
    displayConfirmation(products);
    display(products.products);//product est un objet contenant contact(objet des coordonnées), orderId(string) et products (un tableau des produits présents dans le panier)
    storage.clear();
    hide('cartCount');
})
.catch((res) =>
{
    console.log(res);
});

// Render
function renderProduct(product)
{
    return `
        <div class="displayRow">
            <a href="product.html?id=${product._id}" class="displayColumn" >
                <img src="${product.imageUrl}" alt="${product.name}" class="cartImage"/>
                <h3 class="cartItemName">${product.name}</h3>
            </a>
            <div class="displayColumn" id="${product._id}">
            </div>
        </div>`;
}

function renderModel(product, model)
{
    return `
        <div class="displayRow" id="${setId(product._id, model)}">
            <h4>${model}</h4>
            <p class="unitPrice">${(product.price/100).toFixed(2)} € TTC</p>
            <p class="displayRow  qty"></p>
            <p class="subtotal">Prix total</p>
        </div>`;
}

// Display
function display (products)
{
    displayProducts(storage.get("cart"), products);
    displayQuantities(products);
    displayTotals(products);
    displayIcons();
    displayCartCount();
}

function displayProducts(cart, products)
{
    Object.keys(cart).forEach((id) => 
    {
        document.getElementById("cart").innerHTML += renderProduct(findProduct(products, id));
        displayModels(cart, products, id);
    });
}

function displayModels(cart, products, id)
{
    Object.keys(cart[id]).forEach((model) => 
    {
        document.getElementById(id).innerHTML += renderModel(findProduct(products, id), model);
    });
}

function displayQuantities ()
{
    document.getElementsByClassName(`qty`).forEach((elt) =>
    {
        let source = elt.parentElement.id;
        elt.innerText = `   x${getQuantity(storage.get("cart"), getId(source), getModel(source))}  = `;
    });
}

function displayTotals (products)
{
    let total = 0;
    document.querySelectorAll(`.subtotal`).forEach((elt) =>
    {
        let source = elt.parentElement.id;
        let qty = getQuantity(storage.get("cart"), getId(source), getModel(source));
        let unitPrice = findProduct(products, [getId(source)]).price;
        elt.innerText = calculateSubtotal(unitPrice, qty) + " € TTC";
        total += qty * unitPrice;
    });
    document.getElementById('totalPrice').innerText = (total / 100).toFixed(2) + " € TTC";
}

function displayConfirmation (products)
{
    document.getElementById('firstName').innerText = products.contact.firstName;
    document.getElementById('orderId').innerText = products.orderId;
    document.getElementById('email').innerText = products.contact.email;
}

// Tools
function setId(id, model)
{
    return (model.replace(" ","_") + "__" + id);
}

function getId(string)
{
    let elts = string.split("__");
    return elts[1];
}

function getModel(string)
{
    let elts = string.split("__");
    return elts[0].replace("_", " ");
}

function findProduct(products, id)
{
    let goodKey = Object.keys(products).find((key) =>
        {
            return products[key]["_id"] == id;
        });
    return products[goodKey];
}

function calculateSubtotal(unitPrice, qty)
{
    return (unitPrice * qty / 100).toFixed(2);
}