import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {has, get, set} from './storage.js';
import {haveId, haveModel, addId, addModel, removeId, removeModel, getQuantity, setQuantity, qtyManagement, countCart, displayCartCount, fixValue, isEmpty, disableElt, displayElt} from './utils.js';


fetch('http://localhost:3000/api/teddies/')
    .then((response) => 
    {
        return response.json();
    })
    .then((products) =>
    {
        displayProducts(get("cart"), products);
        displayQuantities(products)
        displayIcons();
        displayCartCount();
        setListeners();
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
            <p>${product.price/100} €</p>
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
            <p class="subTotal">Prix total</p>
        </div>`;
}

// Display
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
        elt.value = getQuantity(get("cart"), getId(source), getModel(source));
    });
}

// Listeners
function setListeners ()
{
    listenInputsChange();
    listenMinusButtons();
    listenPlusButtons();
    listenTrashButtons();
}

function listenInputsChange ()
{
    document.querySelectorAll('input').forEach((elt) =>
    {
        elt.addEventListener('change', (e) =>
        {
            let source = e.currentTarget.parentElement.parentElement.id;
            e.target.value = fixValue(e.target.value);
            qtyManagement(getId(source), getModel(source), e.target.value);
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
            let source = e.currentTarget.parentElement.parentElement.id;
            let qty = --document.querySelector(`#${source} input`).value;
            qtyManagement(getId(source), getModel(source), qty);
            displayManagement(e);
        });

    });
}

function listenPlusButtons ()
{
    document.querySelectorAll('.plusButton').forEach((elt) =>
    {
        elt.addEventListener('click', (e) =>
        {
            let source = e.currentTarget.parentElement.parentElement.id;
            let qty = ++document.querySelector(`#${source} input`).value;
            qtyManagement(getId(source), getModel(source), qty);
            displayManagement(e);
        });

    });
}

function listenTrashButtons ()
{
    document.querySelectorAll('.trashButton').forEach((elt) =>
    {
        elt.addEventListener('click', (e) =>
        {
            let source = e.currentTarget.parentElement.parentElement.id;
            document.querySelector(`#${source} input`).value = 0;
            qtyManagement(getId(source), getModel(source), 0);
            displayManagement(e);
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
    if (haveId(get("cart"),[getId(source.id)]))
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