import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {} from './storage.js';

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
        console.log(product);
    });

function display(product)
{
    displayImage(product);
    displayName(product);
    displayPrice(product);
    displayOptions(product);
    displayDescription(product);
    displayIcons();
}

function displayImage(product)
{
    let image = document.querySelector('#gallery>article>img');
    image.setAttribute('src', product.imageUrl);
    image.setAttribute('alt', product.name);
}

function displayName(product)
{
    document.querySelector('#name').innerText = product.name;
}

function displayPrice(product)
{
    document.querySelector('#price').innerText = (product.price/100).toFixed(2) + ' €';
}

function displayDescription(product)
{
    document.querySelector('#description').innerText = product.description;
}

function displayOptions(product)
{
    document.querySelector('#options').innerHTML = renderOptions(product);
}

function renderOptions(product)
{
    let render;
    product.colors.forEach(color => 
    {
        render += `<option>${color}</option>`;
    });
    return render;
}

function setListeners(product)
{
    listenOptionsChange(product)
}

function listenOptionsChange(product)
{
    document.querySelector('#options').addEventListener('change', (e) =>
    {
        displayQuantity(product, e.target.value);
    });
}

function displayQuantity (productId, productModel)
{
    document.querySelector(`aside>input`).value = 7;
}