import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {ajax} from './utils.js';
import {iconGen} from './jmicons.js';
import {getProductQuantity, setProductQuantity, constructProductId} from './storage.js';

let urlParams = new URLSearchParams(window.location.search);

ajax('http://localhost:3000/api/teddies/' + urlParams.get('id')).then((product) => 
{
    displayProduct(product);
    setInputQuantity(product._id, document.getElementById('model').value);
    setModelChangeListener(product);
    setQuantityChangeListener(product);
    setPlusButtonsListeners(product);
    setMinusButtonsListeners(product);
    setClearProductButtonsListeners(product);
});

function displayProduct(product)
{
    document.getElementById('galery').innerHTML = renderProduct(product);
    document.getElementById('cart').innerHTML = renderCartProduct(product);
    iconGen();
}

function renderProduct (product)
{
    let productHtml = `
    <div class="item">
        <img class="image" src=${product.imageUrl} alt=${product.name}>
        <div class="div">
            <h3 class="nom">${product.name}</h3>
            <p class="price">${product.price/100} €</p>
        </div>
        <div>
            <label for="model">Choisissez un modèle : </label>
            <select name="model" id="model">
    `;
    product.colors.forEach(element => {
        productHtml += `<option value="${element}">${element}</option>`;
    });
    productHtml += `
            </select>
        </div>
        <p class="description">${product.description}</p>
    </div>
    `;
    return productHtml;
}

function renderCartProduct (product)
{
    return `
    <div id="quantity_${product._id}">
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

// function setClearCartButtonListener (product)
// {
//     document.getElementById('clearCartButton').addEventListener('click', ()=>
//     {
//         clearCart(document.querySelector(`#quantity_${product._id} input`));
//     })
// }

function setModelChangeListener (product)
{
    document.getElementById('model').addEventListener('change', (e) =>
    {
        setInputQuantity(product._id, e.target.value);
    });
}

function setInputQuantity (productId, productModel)
{
    // console.log(typeof productModel);
    // console.log(productModel.replace(" ", "_"));
    // console.log(typeof productModel);
    // console.log(constructProductId(productId, productModel));
    document.querySelector(`#quantity_${productId} input`).value = getProductQuantity(constructProductId(productId, productModel));
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
        setProductQuantity(product, product._id, e.target.value, document.getElementById('model').value);
    });
}

function changeInputValue (product, event, modification)
{
    switch (modification) {
        case 1:
            setProductQuantity(product, product._id, ++document.querySelector(`#${event.currentTarget.parentElement.id} input`).value, document.getElementById('model').value);
            break;
        case -1:
            setProductQuantity(product, product._id, --document.querySelector(`#${event.currentTarget.parentElement.id} input`).value, document.getElementById('model').value);
            break;
        case 0:
            document.querySelector(`#${event.currentTarget.parentElement.id} input`).value = 0;
            setProductQuantity(product, product._id, 0, document.getElementById('model').value);
            break;     
    }
}