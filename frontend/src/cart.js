import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {displayIcons} from './jmicons.js';
import {haveId, getQuantity, qtyManagement, displayCartCount, fixTargetValue, activateTargetEvent, increaseTargetValue, decreaseTargetValue, setTargetValue, isEmpty} from './utils.js';
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
            <a href="product.html?id=${product._id}" class="d-flex flex-column text-center col-3" >
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
        <div class="d-flex flex-row align-items-center mb-1" id="${setId(product._id, model)}">
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
    document.querySelectorAll(`#cart input`).forEach((elt) =>
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
        elt.innerText = calculateSubtotal(unitPrice, qty) + " €";
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
}

function listenInputsChange (products)
{
    document.querySelectorAll('#cart input').forEach((elt) =>
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

// Cart validation

document.getElementById('cartValidation').addEventListener('click', (e) => 
{
    if (isEmpty(storage.get('cart')))
    {
        alert("Votre panier est vide !");
    }
    else
    {
        document.getElementById('customer').classList.toggle('noDisplay');
        e.currentTarget.classList.add('noDisplay');
    }
})

// Form manager

let formInstructions = {
    "firstName" : "! Le prénom ne peut contenir que des lettres, des espaces ou des traits d'union (-).",
    "lastName" : "! Le nom ne peut contenir que des lettres, des espaces ou des traits d'union (-).",
    "telNumber" : "! Le numéro de téléphone doit être au format +33123456789 ou 0123456789 (avec ou sans espace/point/trait d'union entre les paires de chiffre).",
    "email" : "! L'adresse mail doit être au format texte@domaine.ext",
    "adress" : "! L'adresse ne peut contenir que des lettres, des espaces, des traits d'union (-), des chiffres, des virgules, des points ou des apostrophes.",
    "complement" : "! Le complément d'adresse ne peut contenir que des lettres, des espaces, des traits d'union (-), des chiffres, des virgules, des points ou des apostrophes.",
    "zipCode" : "! Le code postal doit être composé de 5 chiffres.",
    "city" : "! Le nom de ville ne peut contenir que des lettres, des espaces ou des traits d'union (-)."
};

let formRegExp = {
    "firstName" : /^[\s\p{L}-]+$/u,
    "lastName" : /^[\s\p{L}-]+$/u,
    "telNumber" : /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s\.-]*\d{2}){4}$/,
    "email" : /^(?:[\w\.-]+)@(?:[\w]+)\.(?:[a-zA-Z]{2,4})$/i,
    "adress" : /^[\s\d\x27\x2c\.\p{L}-]+$/u, //accepte les espaces (\s), les nombres (\d), les apostrophes (\x27), les virgules (\x2c), les points (\.), les lettres dont celles accentuées (\p{L}) et les tirets (-)
    "complement" : /^[\s\d\u{0027}\p{L}-]+$/u,
    "zipCode" : /^[0-9]{5}$/,
    "city" : /^[\s\p{L}-]+$/u
};

let formInputs = document.querySelectorAll("form input");
formInputs.forEach((input) => {
    input.addEventListener("change", () => {
        if (formRegExp[input.id].test(input.value))
        {
            input.classList.remove("bg-warning");
            input.nextElementSibling.innerText = "";
        }
        else
        {
            input.classList.add("bg-warning");
            input.value = "";
            input.nextElementSibling.innerText = formInstructions[input.id];
        }
    });
});

//billing address manager

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

//command
document.getElementById('command').addEventListener('click', (e) =>
{
    e.preventDefault();
    let formInputs = Array.from(document.querySelectorAll("form input[required]"));
    if (formInputs.some(isInputEmpty))
    {
        alert("Il reste des champs à compléter !");
        return;
    }
    
    storage.remove("contact");
    storage.set("contact", createContact());
    redirect("resume.html");
});

function isInputEmpty(input)
{
    return (input.value == "")
}

function redirect(url)
{
    location.href = url;
}

function createContact ()
{
    let contact = {
        firstName : document.getElementById("firstName").value,
        lastName : document.getElementById("lastName").value,
        address : document.getElementById("address").value,
        city : `${document.getElementById("city").value} (${document.getElementById("zipCode").value})`,
        email : document.getElementById("email").value
    };
    if (!isInputEmpty(document.getElementById("complement")))
    {
        contact.address += ` - ${document.getElementById("complement").value}`;
    }
    return contact;
}