//How to get back products which are in the cart

let myCommand = {
    contact : {
        firstName : "Prénom",
        lastName : "NOM",
        address : "adresse",
        city : "ville",
        email : "adresse@mail.fr"
    },
    products : ["5be9c8541c9d440000665243", "5beaa8bf1c9d440000a57d94"]
};

fetch('http://localhost:3000/api/teddies/order',
{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify(myCommand)
})

.then((res) => 
{
    return res.json();
})
.then((products) =>
{
    console.log((products.products)); //product est un objet contenant contact(objet des coordonnées), orderId(string) et products (un tableau des produits présents dans le panier)
})
.catch((res) =>
{
    console.log(res)
});