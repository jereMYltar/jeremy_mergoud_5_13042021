import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {Storage} from './storage.js';

let storage = new Storage();

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
    let cart = storage.get("cart");
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
    storage.set("cart", cart);
}

export function qtyManagement (id, model, qty)
{
    setQuantity(id, model, qty);
    displayCartCount();
}

export function countCart()
{
    let cart = storage.get("cart");
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
    let total = countCart();
    document.getElementById("cartCount").innerText = total;
    hide("cartCount");
    if (total > 0)
    {
        show("cartCount");
    }
}

//Target interraction
export function activateTargetEvent(target, event)
{
    let action = new Event(event);
    target.dispatchEvent(action);
}

export function increaseTargetValue(target)
{
    return ++target.value;
}

export function decreaseTargetValue(target)
{
    return --target.value;
}

export function setTargetValue(target, value)
{
    target.value = value;
}

export function fixTargetValue (target)
{
    if (target.value < 0)
    {
        target.value = 0;
    }
    else
    {
        target.value = Math.floor(target.value);
    }
}

//Generic tools

export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

export function makeEltClickable(elt, qty)
{
    elt.setAttribute("disabled", true);
    if (qty > 0)
    {
        elt.removeAttribute("disabled");
    }
}

export function show(id)
{
        document.getElementById(id).style.display = "flex";
}

export function hide(id)
{
    document.getElementById(id).style.display = "none";
}

