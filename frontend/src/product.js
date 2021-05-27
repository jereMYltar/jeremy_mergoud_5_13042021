import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {Storage} from './storage.js';
import {getQuantity, qtyManagement, displayCartCount, fixTargetValue, makeEltClickable, increaseTargetValue, decreaseTargetValue, setTargetValue, activateTargetEvent} from './utils.js';

let storage = new Storage();

let urlParams = new URLSearchParams(window.location.search);
fetch('http://localhost:3000/api/teddies/' + urlParams.get('id'))
    .then((response) => 
    {
        return response.json();
    })
    .then((product) =>
    {
        display(product);
        listen();
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
    document.querySelector(`aside>input`).value = getQuantity(storage.get("cart"), id, model);
    makeEltClickable(document.querySelector('#minusButton'), getQuantitySelected());
}

// Listeners
function listen ()
{
    listenOptionsChange();
    listenInputChange();
    listenMinusButton ();
    listenPlusButton();
    listenTrashButton ();
}

function listenOptionsChange ()
{
    document.querySelector('#options').addEventListener('change', (e) =>
    {
        displayQuantity (urlParams.get('id'), getModelSelected());
    });
}

function listenInputChange ()
{
    document.querySelector('aside>input').addEventListener('change', (e) =>
    {
        fixTargetValue(e.target);
        qtyManagement(urlParams.get('id'), getModelSelected(), getQuantitySelected());
        makeEltClickable(document.querySelector('#minusButton'), getQuantitySelected());
    });
}

function listenMinusButton ()
{
    document.querySelector('#minusButton').addEventListener('click', (e) =>
    {
        let target = document.querySelector(`#${e.currentTarget.parentElement.id} input`);
        decreaseTargetValue(target);
        activateTargetEvent(target, "change");
    });
}

function listenPlusButton ()
{
    document.querySelector('#plusButton').addEventListener('click', (e) =>
    {
        let target = document.querySelector(`#${e.currentTarget.parentElement.id} input`);
        increaseTargetValue(target);
        activateTargetEvent(target, "change");
    });
}

function listenTrashButton ()
{
    document.querySelector('#trashButton').addEventListener('click', (e) =>
    {
        let target = document.querySelector(`#${e.currentTarget.parentElement.id} input`);
        setTargetValue(target, 0);
        activateTargetEvent(target, "change");
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