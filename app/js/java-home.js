/* Per sezione ACCORDITION/immetti codice  */
const cont = document.getElementsByClassName("contentbox");

for (var i = 0; i < cont.length; i++) {
    cont[i].addEventListener("click", function (event) {
        if (event.target.classList.contains("label")) {
            this.classList.toggle("active");
        }
    });
}
/* FINE ----- Per sezione ACCORDITION/immetti codice  */
