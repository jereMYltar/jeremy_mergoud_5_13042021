// Form manager

let formInstructions = {
    "firstName" : "! Le prénom ne peut contenir que des lettres, des espaces ou des traits d'union (-).",
    "lastName" : "! Le nom ne peut contenir que des lettres, des espaces ou des traits d'union (-).",
    "telNumber" : "! Le numéro de téléphone doit être au format +33123456789 ou 0123456789 (avec ou sans espace/point/trait d'union entre les paires de chiffre).",
    "email" : "! L'adresse mail doit être au format texte@domaine.ext",
    "address" : "! L'adresse ne peut contenir que des lettres, des espaces, des traits d'union (-), des chiffres, des virgules, des points ou des apostrophes.",
    "complement" : "! Le complément d'adresse ne peut contenir que des lettres, des espaces, des traits d'union (-), des chiffres, des virgules, des points ou des apostrophes.",
    "zipCode" : "! Le code postal doit être composé de 5 chiffres.",
    "city" : "! Le nom de ville ne peut contenir que des lettres, des espaces ou des traits d'union (-)."
};

let formRegExp = {
    "firstName" : /^[\s\p{L}-]+$/u,
    "lastName" : /^[\s\p{L}-]+$/u,
    "telNumber" : /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s\.-]*\d{2}){4}$/,
    "email" : /^(?:[\w\.-]+)@(?:[\w]+)\.(?:[a-zA-Z]{2,4})$/i,
    "address" : /^[\s\d\x27\x2c\.\p{L}-]+$/u, //accepte les espaces (\s), les nombres (\d), les apostrophes (\x27), les virgules (\x2c), les points (\.), les lettres dont celles accentuées (\p{L}) et les tirets (-)
    "complement" : /^[\s\d\u{0027}\p{L}-]+$/u,
    "zipCode" : /^[0-9]{5}$/,
    "city" : /^[\s\p{L}-]+$/u
};

export function listenFormInputsChanges ()
{
    let formInputs = document.querySelectorAll("form input");
    formInputs.forEach((input) => {
        input.addEventListener("change", () => {
            toggleError(input, formRegExp[input.id].test(input.value));
        });
    });
}

function deleteError (input)
{
    input.classList.remove("bg-warning");
    input.nextElementSibling.innerText = "";
    
}

function displayError (input)
{
    input.classList.add("bg-warning");
    input.value = "";
    input.nextElementSibling.innerText = formInstructions[input.id];
}

function toggleError (input, test)
{
    if (test)
    {
        deleteError(input);
    }
    else
    {
        displayError(input);
    }
}
