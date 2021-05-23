import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {has, get, setProductQuantity, remove, set} from './storage2.js';

let urlParams = new URLSearchParams(window.location.search);
fetch('http://localhost:3000/api/teddies/' + urlParams.get('id'))
    .then((response) => 
    {
        return response.json();
    })
    .then((product) =>
    {
        display(product);
        setListeners(product);
    });

// Display
function display (product)
{
    displayImage(product);
    displayName(product);
    displayPrice(product);
    displayOptions(product);
    displayDescription(product);
    displayQuantity(product._id, getModelSelected());
    displayIcons();
}

function displayImage (product)
{
    let image = document.querySelector('#gallery>article>img');
    image.setAttribute('src', product.imageUrl);
    image.setAttribute('alt', product.name);
}

function displayName (product)
{
    document.querySelector('#name').innerText = product.name;
}

function displayPrice (product)
{
    document.querySelector('#price').innerText = `Prix unitaire : ${(product.price/100).toFixed(2)} € TTC`;
}

function displayDescription (product)
{
    document.querySelector('#description').innerText = product.description;
}

function displayOptions (product)
{
    document.querySelector('#options').innerHTML = renderOptions(product);
}

function renderOptions (product)
{
    let render;
    product.colors.forEach(color => 
    {
        render += `<option>${color}</option>`;
    });
    return render;
}

function displayQuantity (id, model)
{
    document.querySelector(`aside>input`).value = getQuantity(get("cart"), id, model);
}

// Listeners
function setListeners (product)
{
    listenOptionsChange(product);
    listenInputChange(product);
    listenMinusButton (product);
    listenPlusButton(product);
    listenTrashButton (product);
}

function listenOptionsChange (product)
{
    document.querySelector('#options').addEventListener('change', (e) =>
    {
        displayQuantity (product._id, getModelSelected());
    });
}

function listenInputChange (product)
{
    document.querySelector('aside>input').addEventListener('change', (e) =>
    {
        e.target.value = fixValue(e.target.value);
        changeQuantity(product._id, getModelSelected(), getQuantitySelected());
    });
}

function listenMinusButton (product)
{
    document.querySelector('#minusButton').addEventListener('click', (e) =>
    {
        --document.querySelector(`#${e.currentTarget.parentElement.id} input`).value;
        changeQuantity(product._id, getModelSelected(), getQuantitySelected());
    });
}

function listenPlusButton (product)
{
    document.querySelector('#plusButton').addEventListener('click', (e) =>
    {
        ++document.querySelector(`#${e.currentTarget.parentElement.id} input`).value;
        changeQuantity(product._id, getModelSelected(), getQuantitySelected());
    });
}

function listenTrashButton (product)
{
    document.querySelector('#trashButton').addEventListener('click', (e) =>
    {
        document.querySelector(`#${e.currentTarget.parentElement.id} input`).value = 0;
        changeQuantity(product._id, getModelSelected(), getQuantitySelected());
    });
}

//has, add or remove id/model in an obj
function haveId (obj, id)
{
    return (obj && obj[id]);
}

function haveModel (obj, id, model)
{
    return (haveId(obj, id) && obj[id][model]);
}

function addId (obj, id)
{
    if (!haveId(obj, id))
    {
        obj[id] = {};
    }
}

function addModel (obj, id, model)
{
    if (!haveModel(obj, id, model))
    {
        obj[id][model] = "";
    }
}

function removeId (obj, id)
{
    if (isEmpty(obj[id]))
    {
        delete obj[id];
    }
}

function removeModel (obj, id, model)
{
    delete obj[id][model];
}

//tools
function getQuantity (obj, id, model)
{
    if (haveModel(obj, id, model))
    {
        return obj[id][model];
    }
    return 0;
}

function changeQuantity (id, model, qty)
{
    let cart = get("cart");
    if (qty == 0 && !isEmpty(cart))
    {
        removeModel(cart, id, model);
        removeId(cart, id);
    }
    else if (qty > 0)
    {
        addId(cart, id);
        addModel(cart, id, model);
        cart[id][model] = qty;
    }
    set("cart", cart);
}

function getQuantitySelected ()
{
    return document.querySelector('aside>input').value;
}

function getModelSelected ()
{
    return document.querySelector('#options').value;
}

function fixValue (value)
{
    if (value < 0)
    {
        return 0;
    }
    return Math.floor(value);
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }