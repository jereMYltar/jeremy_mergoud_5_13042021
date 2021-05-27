import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {haveId, getQuantity, qtyManagement, displayCartCount, fixTargetValue, activateTargetEvent, increaseTargetValue, decreaseTargetValue, setTargetValue} from './utils.js';
import {Storage} from './storage.js';

let storage = new Storage();

fetch('http://localhost:3000/api/teddies/')
    .then((response) => 
    {
        return response.json();
    })
    .then((products) =>
    {
        display(products);
        listen(products);
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
            <div class="displayRow" id="${model.replace(" ", "_")}_qty">
                <button class="minusButton">
                    <i class="jmi_minusSimple"></i>
                </button>
                <input type="number" min=0 value="0" />
                <button class="plusButton">
                    <i class="jmi_plusSimple"></i>
                </button>
                <button class="trashButton">
                    <i class="jmi_trashFill"></i>
                </button>
            </div>
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
    document.querySelectorAll(`input`).forEach((elt) =>
    {
        let source = elt.parentElement.parentElement.id;
        elt.value = getQuantity(storage.get("cart"), getId(source), getModel(source));
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

// Listeners
function listen (products)
{
    listenInputsChange(products);
    listenMinusButtons();
    listenPlusButtons();
    listenTrashButtons();
}

function listenInputsChange (products)
{
    document.querySelectorAll('input').forEach((elt) =>
    {
        elt.addEventListener('change', (e) =>
        {
            fixTargetValue(e.target);
            let source = e.currentTarget.parentElement.parentElement.id;
            qtyManagement(getId(source), getModel(source), e.target.value);
            displayTotals(products);
            displayManagement(e);
        });

    });
}

function listenMinusButtons ()
{
    document.querySelectorAll('.minusButton').forEach((elt) =>
    {
        elt.addEventListener('click', (e) =>
        {
            let target = document.querySelector(`#${e.currentTarget.parentElement.parentElement.id} input`);
            decreaseTargetValue(target);
            activateTargetEvent(target, "change");
        });

    });
}

function listenPlusButtons ()
{
    document.querySelectorAll('.plusButton').forEach((elt) =>
    {
        elt.addEventListener('click', (e) =>
        {
            let target = document.querySelector(`#${e.currentTarget.parentElement.parentElement.id} input`);
            increaseTargetValue(target);
            activateTargetEvent(target, "change");
        });
        
    });
}

function listenTrashButtons ()
{
    document.querySelectorAll('.trashButton').forEach((elt) =>
    {
        elt.addEventListener('click', (e) =>
        {
            let target = document.querySelector(`#${e.currentTarget.parentElement.parentElement.id} input`);
            setTargetValue(target, 0);
            activateTargetEvent(target, "change");
        });

    });
}

// Display management
function displayManagement (elt)
{
    let source = elt.currentTarget.parentNode.parentNode;
    if (document.querySelector(`#${source.id} input`).value == 0)
    {
        removeElementDisplayed(source)
    };
}

function removeElementDisplayed (source)
{
    if (haveId(storage.get("cart"),[getId(source.id)]))
    {
        source.remove();
    }
    else
    {
        source.parentNode.parentNode.remove();
    }
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