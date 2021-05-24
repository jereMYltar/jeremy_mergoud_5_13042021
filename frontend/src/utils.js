import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {has, get, set} from './storage.js';

export function ajax(url, method = 'GET') {
    return new Promise((resolve, reject) => 
    {
        let request = new XMLHttpRequest();
        request.open(method, url);

        request.addEventListener('load', function()
        {
            if (request.status >= 200) {
                resolve(JSON.parse(request.response));
            } else {
                reject(request.statusText)
            }
        })

        request.setRequestHeader("Content-Type", "application/JSON;charset=UTF-8");
        request.send();

    })
}

//has, add or remove id/model in an obj
export function haveId (obj, id)
{
    return (obj && obj[id]);
}

export function haveModel (obj, id, model)
{
    return (haveId(obj, id) && obj[id][model]);
}

export function addId (obj, id)
{
    if (!haveId(obj, id))
    {
        obj[id] = {};
    }
}

export function addModel (obj, id, model)
{
    if (!haveModel(obj, id, model))
    {
        obj[id][model] = "";
    }
}

export function removeId (obj, id)
{
    if (isEmpty(obj[id]))
    {
        delete obj[id];
    }
}

export function removeModel (obj, id, model)
{
    delete obj[id][model];
}

//cart quantity management
export function getQuantity (obj, id, model)
{
    if (haveModel(obj, id, model))
    {
        return obj[id][model];
    }
    return 0;
}

export function setQuantity (id, model, qty)
{
    let cart = get("cart");
    if (qty == 0 && haveModel(cart, id, model))
    {
        removeModel(cart, id, model);
        removeId(cart, id);
    }
    else if (qty > 0)
    {
        addId(cart, id);
        addModel(cart, id, model);
        cart[id][model] = parseInt(qty, 10);
    }
    set("cart", cart);
}

export function qtyManagement (id, model, qty)
{
    setQuantity(id, model, qty);
    displayCartCount();
}

export function countCart()
{
    let cart = get("cart");
    let count = 0;
    Object.keys(cart).forEach((id) =>
    {
        Object.keys(cart[id]).forEach((model) =>
        {
            count += parseInt(cart[id][model], 10);
        })
    })
    return count;
}

export function displayCartCount()
{
    let elt = document.querySelector("#cartCount");
    elt.innerText = countCart();
    displayElt(elt, countCart());
}

//tools
export function fixValue (value)
{
    if (value < 0)
    {
        return 0;
    }
    return Math.floor(value);
}

export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

export function disableElt(elt, qty)
{
    if (qty <= 0)
    {
        elt.setAttribute("disabled", true);
    }
    else
    {
        elt.removeAttribute("disabled");
    }
}

export function displayElt(elt, qty)
{
    if (qty <= 0)
    {
        // elt.classList.add("noDisplay");
        elt.style.display = "none";
    }
    else
    {
        // elt.classList.remove("noDisplay");
        elt.style.display = "flex";
    }
}