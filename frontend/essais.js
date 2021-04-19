// function test () {
//     ['teddies', 'furniture', 'cameras'].forEach(element => {
//         getCollection(urlServer, element, 'GET').then(console.log);
//     });
// }

/*----------------------------------------------*/

//Global variable to host server's URL
let urlServer = 'http://localhost:3000/api/';

//Promise to exchange with the server :
//serveur is the server's URL
//category is the end of the server's URL
//method is the HTML method
async function getCollection (serveur, category, method) {
    let res;
    let request = new XMLHttpRequest();
    request.open(method, serveur + category);
    request.responseType = 'text';
    request.send();
    await new Promise((resolve, reject) => {
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                resolve(JSON.parse(request.response));
            }
        }
    }).then((x) => res = x);
    return res;
}

//creation of one tile for one product whitch is in collection at position n° position
function createProductTile (collection, position) {
    let item = document.createElement('div');
    let image = document.createElement('img');
    let div = document.createElement('div');
    let nom = document.createElement('h3');
    let price = document.createElement('p');
    let description = document.createElement('p');
    let tile = [item, image, div, nom, price, description];
    let tileString = ['item', 'image', 'div', 'nom', 'price', 'description'];

    let galery = document.getElementById('galery');
    galery.appendChild(item);
    item.append(image, div, description);
    div.append(nom, price);

    for (let i=0; i < tile.length; i++) {
        tile[i].setAttribute('id', tileString[i]+'_'+position);
        tile[i].setAttribute('class', tileString[i]);
    }
    
    image.setAttribute('src', collection[position].imageUrl);
    image.setAttribute('alt', 'Photographie de l\'ours en peluche ' + collection[position].name);
    nom.textContent = collection[position].name;
    price.textContent = collection[position].price +  ' kopecks';
    description.textContent = collection[position].description;
}

//creation of one tile per product in the obj collection by calling createProductTile
function createAllTiles(obj) {
    for (let x in obj) {
        createProductTile(obj, x);
    }
}

//creation of all product tiles by callinf createAllTiles on the serveur response (on button click)
let btnAdd = document.getElementById("btnAdd");
btnAdd.addEventListener('click', () => {
    getCollection(urlServer, 'teddies', 'GET')
        .then((x) => {
            // console.log(x);
            createAllTiles(x);
        });
});

//removal of all product tiles (on button double click)
let btnRemove = document.getElementById("btnRemove");
btnRemove.addEventListener('dblclick', () => {
    let galery = document.getElementById('galery');
    while (galery.lastElementChild) {
        galery.removeChild(galery.lastElementChild);
    }
});



