import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '../style/style.scss';
import {displayIcons} from './jmicons.js';
import * as utils from './utils.js';
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
.then((command) =>
{
    display(command.products);
    displayConfirmation(command);
    storage.clearCart();
})
.catch((res) =>
{
    console.log(res);
    alert("Une erreur s'est produite, veuillez réessayer.");
    utils.redirect("../pages/index.html");
});

// Render
function renderProduct(product)
{
        return `
        <div class="d-flex flex-row p-4">
            <a href="./product.html?id=${product._id}" class="d-flex flex-column text-center col-3" >
                <img src="${product.imageUrl}" alt="${product.name}" class="w-100 col-10 text-center"/>
                <h3 class="fs-4 fw-bold">${product.name}</h3>
            </a>
            <div class="d-flex flex-column px-2 col-9" id="${product._id}">
            </div>
        </div>`;
}

function renderModel(product, model)
{
    return `
        <div class="displayRow" id="${utils.setId(product._id, model)}">
            <h4 class="fs-6 text-center m-0 col-2">${model}</h4>
            <p class="unitPrice fs-6 text-center m-0 col-2">${(product.price/100).toFixed(2)} €</p>
            <p class="displayRow qty fs-6 text-center m-0 col-3"></p>
            <p class="subtotal fs-6 text-end m-0 col-2">Prix total</p>
        </div>`;
}

// Display
function display (products)
{
    displayProducts(storage.get("cart"), products);
    displayQuantities(products);
    displayTotals(products);
    displayIcons();
}

function displayProducts(cart, products)
{
    Object.keys(cart).forEach((id) => 
    {
        document.getElementById("cart").innerHTML += renderProduct(utils.findProduct(products, id));
        displayModels(cart, products, id);
    });
}

function displayModels(cart, products, id)
{
    Object.keys(cart[id]).forEach((model) => 
    {
        document.getElementById(id).innerHTML += renderModel(utils.findProduct(products, id), model);
    });
}

function displayQuantities ()
{
    document.getElementsByClassName(`qty`).forEach((elt) =>
    {
        let source = elt.parentElement.id;
        elt.innerText = `${utils.getQuantity(storage.get("cart"), utils.getId(source), utils.getModel(source))}`;
    });
}

function displayTotals (products)
{
    let total = 0;
    document.querySelectorAll(`.subtotal`).forEach((elt) =>
    {
        let source = elt.parentElement.id;
        let qty = utils.getQuantity(storage.get("cart"), utils.getId(source), utils.getModel(source));
        let unitPrice = utils.findProduct(products, [utils.getId(source)]).price;
        elt.innerText = utils.calculateSubtotal(unitPrice, qty) + " €";
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