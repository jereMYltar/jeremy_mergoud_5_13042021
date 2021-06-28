import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '../style/style.scss';
import {displayIcons} from './jmicons.js';
import * as utils from './utils.js';
import * as form from './form.js';
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
        <div class="d-flex flex-row align-items-center mb-1" id="${utils.setId(product._id, model)}">
            <h4 class="fs-5 text-start col-3 m-0">${model}</h4>
            <p class="fs-5 text-center col-2 m-0">${(product.price/100).toFixed(2)} €</p>
            <div class="d-flex flex-row fs-5 col-3 mx-auto" id="${model.replace(" ", "_")}_qty">
                <button class="minusButton bg-none border-0">
                    <i class="jmi_minusSimple"></i>
                </button>
                <input type="number" min=0 value="0" class="border-0 col-5"/>
                <button class="plusButton bg-none border-0">
                    <i class="jmi_plusSimple"></i>
                </button>
                <button class="trashButton bg-none border-0 mx-2">
                    <i class="jmi_trashFill"></i>
                </button>
            </div>
            <p class="subtotal m-0 text-end fs-5 col-2">Prix total</p>
        </div>`;
}

// Display
function display (products)
{
    displayProducts(storage.get("cart"), products);
    displayQuantities(products);
    displayTotals(products);
    displayIcons();
    utils.displayCartCount();
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
    document.querySelectorAll(`#cart input`).forEach((elt) =>
    {
        let source = elt.parentElement.parentElement.id;
        elt.value = utils.getQuantity(storage.get("cart"), utils.getId(source), utils.getModel(source));
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
    document.getElementById('totalPrice').innerText = (total / 100).toFixed(2) + " €";
}

// Listeners
function listen (products)
{
    listenInputsChange(products);
    listenMinusButtons();
    listenPlusButtons();
    listenTrashButtons();
    form.listenFormInputsChanges();
    listenCartValidationButton();
    listenBillingCheckboxChange();
    listenCommandButtonChange();

}

function listenInputsChange (products)
{
    document.querySelectorAll('#cart input').forEach((elt) =>
    {
        elt.addEventListener('change', (e) =>
        {
            utils.fixTargetValue(e.target);
            let source = e.currentTarget.parentElement.parentElement.id;
            utils.qtyManagement(utils.getId(source), utils.getModel(source), e.target.value);
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
            utils.decreaseTargetValue(target);
            utils.activateTargetEvent(target, "change");
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
            utils.increaseTargetValue(target);
            utils.activateTargetEvent(target, "change");
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
            utils.setTargetValue(target, 0);
            utils.activateTargetEvent(target, "change");
        });

    });
}

function listenCartValidationButton ()
{
    document.getElementById('cartValidation').addEventListener('click', (e) => 
    {
        if (utils.isEmpty(storage.get('cart')))
        {
            alert("Votre panier est vide !");
        }
        else
        {
            document.getElementById('customer').classList.toggle('noDisplay');
            e.currentTarget.classList.add('noDisplay');
        }
    });
}

function listenBillingCheckboxChange ()
{
    let billingAddressBlock = document.getElementById("billingAddressBlock");
    billingAddressBlock.style.display = "none";
    let billingCheckBox = document.getElementById("billingCheckBox");
    billingCheckBox.addEventListener("change", (e) => 
    {
        if (billingCheckBox.checked == true)
        {
            billingAddressBlock.style.display = "none";
        }
        else
        {
            billingAddressBlock.style.display = "block";
        }
    });
}

function listenCommandButtonChange ()
{
    document.getElementById('command').addEventListener('click', (e) =>
    {
        e.preventDefault();
        let formInputs = Array.from(document.querySelectorAll("form input[required]"));
        if (formInputs.some(utils.isInputEmpty))
        {
            alert("Il reste des champs à compléter !");
            return;
        }
        
        storage.remove("contact");
        storage.set("contact", createContact());
        utils.redirect("../pages/resume.html");
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
    if (utils.haveId(storage.get("cart"),[utils.getId(source.id)]))
    {
        source.remove();
    }
    else
    {
        source.parentNode.parentNode.remove();
    }
}

//other function
function createContact ()
{
    let contact = {
        firstName : document.getElementById("firstName").value,
        lastName : document.getElementById("lastName").value,
        address : document.getElementById("address").value,
        city : `${document.getElementById("city").value} (${document.getElementById("zipCode").value})`,
        email : document.getElementById("email").value
    };
    if (!utils.isInputEmpty(document.getElementById("complement")))
    {
        contact.address += ` - ${document.getElementById("complement").value}`;
    }
    return contact;
}