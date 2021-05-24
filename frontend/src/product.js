import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {has, get, set} from './storage.js';
import {haveId, haveModel, addId, addModel, removeId, removeModel, getQuantity, setQuantity, qtyManagement, countCart, displayCartCount, fixValue, isEmpty, disableElt, displayElt} from './utils.js';

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
    displayCartCount();
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
    disableElt(document.querySelector('#minusButton'), getQuantitySelected());
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
        qtyManagement(product._id, getModelSelected(), getQuantitySelected());
        disableElt(document.querySelector('#minusButton'), getQuantitySelected());
    });
}

function listenMinusButton (product)
{
    document.querySelector('#minusButton').addEventListener('click', (e) =>
    {
        --document.querySelector(`#${e.currentTarget.parentElement.id} input`).value;
        qtyManagement(product._id, getModelSelected(), getQuantitySelected());
        disableElt(document.querySelector('#minusButton'), getQuantitySelected());
    });
}

function listenPlusButton (product)
{
    document.querySelector('#plusButton').addEventListener('click', (e) =>
    {
        ++document.querySelector(`#${e.currentTarget.parentElement.id} input`).value;
        qtyManagement(product._id, getModelSelected(), getQuantitySelected());
        disableElt(document.querySelector('#minusButton'), getQuantitySelected());
    });
}

function listenTrashButton (product)
{
    document.querySelector('#trashButton').addEventListener('click', (e) =>
    {
        document.querySelector(`#${e.currentTarget.parentElement.id} input`).value = 0;
        qtyManagement(product._id, getModelSelected(), getQuantitySelected());
        disableElt(document.querySelector('#minusButton'), getQuantitySelected());
    });
}

//data recovering
function getQuantitySelected ()
{
    return document.querySelector('aside>input').value;
}

function getModelSelected ()
{
    return document.querySelector('#options').value;
}