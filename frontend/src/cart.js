import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {ajax} from './utils.js';
import {iconGen} from './jmicons.js';
import {getProductQuantity, setProductQuantity, getStorageObject} from './storage.js';

displayCart(getStorageObject());

iconGen();

function displayCart (object)
{
    if (Object.keys(object).length == 0)
    {
        document.getElementById('cart').innerHTML = `<p>Votre panier est vide</p>`;
    }
    else
    {
        document.getElementById('cart').innerHTML = ``;
        Object.keys(object).forEach(key => {
            displayProduct(key, object);
        });
    }
}

function displayProduct (key, object)
{
    document.getElementById('cart').innerHTML += renderItem(key, object);
    // console.log(object[key]);
    // console.log(key);
    // console.log(object[key]['color']);
    // console.log(getProductQuantity(key));
    setInputQuantity(object[key], key, object[key]['color']);
}

function renderItem (key, object)
{
    return `<div class="${key} cartItem">` + renderItemDescription(key, object) + renderItemQuantity(key, object) + renderItemTotalPrice(key, object) + `</div>`
}

function renderItemDescription (key, object)
{
    return `
    <div id="description_${key}" class="cartItem">
        <a href="product.html?id=${object[key]['_id']}">
            <img class="cartImage" src="${object[key]['imageUrl']}" alt="${object[key]['name']} ${object[key]['color']}"/>
        </a>
        <div class="">
            <a href="product.html?id=${object[key]['_id']}" class="cartItemName">${object[key]['name']}</a>
            <p>${object[key]['color']}</p>
            <p>Disponible</p>
            <p>${(object[key]['price']/100).toFixed(2)} €</p>
        </div>
    </div>
    `;
}

function renderItemQuantity (key, object)
{
    return `
    <div id="quantity_${key}">
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
    `;
}

function renderItemTotalPrice (key, object)
{
    return `<div class="cartItemName">${(object[key]['totalPrice']/100).toFixed(2)} €</div>`
}





function setInputQuantity (product, productId, productModel)
{
    document.querySelector(`#quantity_${productId} input`).value = getProductQuantity (product, productModel);
}

function setPlusButtonsListeners (product)
{
    document.querySelectorAll('button.plusButton').forEach( (element) =>
    {
        element.addEventListener('click', (e) =>
        {
            changeInputValue(product, e, 1);
        });
    });
}

function setMinusButtonsListeners (product)
{
    document.querySelectorAll('button.minusButton').forEach( (element) =>
    {
        element.addEventListener('click', (e) =>
        {
            changeInputValue(product, e, -1);
        });
    });
}

function setClearProductButtonsListeners (product)
{
    document.querySelectorAll('button.trashButton').forEach( (element) =>
    {
        element.addEventListener('click', (e) =>
        {
            changeInputValue(product, e, 0);
        });
    });
}

function setQuantityChangeListener (product)
{
    document.querySelector(`#quantity_${product._id} input`).addEventListener('change', (e) =>
    {
        setProductQuantity(product, e.target.value, document.getElementById('model').value);
    });
}

function changeInputValue (product, event, modification)
{
    switch (modification) {
        case 1:
            setProductQuantity(product, ++document.querySelector(`#${event.currentTarget.parentElement.id} input`).value, document.getElementById('model').value);
            break;
        case -1:
            setProductQuantity(product, --document.querySelector(`#${event.currentTarget.parentElement.id} input`).value, document.getElementById('model').value);
            break;
        case 0:
            document.querySelector(`#${event.currentTarget.parentElement.id} input`).value = 0;
            setProductQuantity(product, 0, document.getElementById('model').value);
            break;     
    }
}