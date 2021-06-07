// promenne
var buttonSubmit = document.querySelector('#submitButton');
var queryInput = document.querySelector('#zeme');
var moreResults = document.getElementById('moreResults');
var moreResultAlert = document.getElementById('moreResultAlert');
var alredyExistAlert = document.getElementById('alredyExistAlert');
var notFoundAlert = document.getElementById('notFoundAlert');
var vysledek = document.getElementById('vysledek');
var historyArray = new Array();
var favouritesArray = new Array();
var myJson = [];
var state = null;


//funkce pro zobrazeni dat z pole
function printArray(array, elementID) {
    var list = document.getElementById(elementID);
    list.innerHTML = '';
    for (i = 0; i < array.length; i++) {
        var inputNode = document.createElement("LI");
        inputNode.className = "";
        var textnodeInput = document.createTextNode(array[i]);
        inputNode.appendChild(textnodeInput);
        list.append(inputNode);
    }
}

//funkce pro zobrazeni dat z pole se strukturou(objektem)
function printArrayOfObjects(array, elementID, arrayLength, object) {
    var list = document.getElementById(elementID);
    list.innerHTML = '';

    for (i = 0; i < arrayLength; i++) {
        var inputNode = document.createElement("LI");
        inputNode.className = "";
        var textnodeInput = document.createTextNode(array[i][object]);
        inputNode.appendChild(textnodeInput);
        list.append(inputNode);
    }
}

//funkce pro zobrazeni dat z LocalStorage
function printLocalStorage(array, elementID, index) {
    var inputNode = document.createElement("LI");
    inputNode.className = "";
    var textnodeInput = document.createTextNode(array[index]);
    inputNode.appendChild(textnodeInput);
    document.getElementById(elementID).prepend(inputNode);
}

// funkce zajisti vyhledani zeme po kliknuti na jeji nazev v seznamu ul li
// (vytvori seznam odkazu)
function createLinkFromList() {
    var activeListItems = document.querySelectorAll('.activeList li');

    function createActiveLinkEvent() {

        // po kliknuti na polozku dojde k jejimu zobrazeni
        queryInput.value = event.currentTarget.innerHTML;
        buttonSubmit.click();
        location.href = "#";
        location.href = "#vysledek";
    }

    function addListenerToActiveLink(item) {
        if (item.listener != true) {
            item.listener = true;
            item.addEventListener('click', createActiveLinkEvent);
        }
    }

    // volani funkce na vsechny prvky listu activeListItems
    activeListItems.forEach(addListenerToActiveLink);
}

// zobrazeni historie z local storage po otevreni stranky
if (localStorage.getItem("history") !== null) {

    // prevedeni ze stringu do pole
    historyString = localStorage.getItem("history");
    historyArray = historyString.split(',');

    for (var i = historyArray.length - 1; i >= 0; --i) {
        printLocalStorage(historyArray, 'historyInput', i);
    }
}

// zobrazeni oblibenych z local storage po otevreni stranky
if (localStorage.getItem("favourites") !== null) {

    // prevedeni ze stringu do pole
    favouritesString = localStorage.getItem("favourites");
    favouritesArray = favouritesString.split(',');

    for (var i = favouritesArray.length - 1; i >= 0; --i) {
        printLocalStorage(favouritesArray, 'favouritesInput', i);
    }
}

createLinkFromList();


// funkce pro vyhledani zeme
buttonSubmit.onclick = function () {
    notFoundAlert.style.display = 'none';
    moreResultAlert.style.display = 'none';
    alredyExistAlert.style.display = 'none';
    state = null;

    var url = 'https://restcountries.eu/rest/v2/name/' + queryInput.value;

    fetch(url)
        .then(function (response) {
            return response.json();
        })

        .then(function (myJson) {
            console.log(myJson);

            // osetreni pripadu pokud je nalezeno vice moznych zemi
            if (myJson.length > 1) {

                //zobrazeni varovani
                moreResultAlert.style.display = 'inline';

                printArrayOfObjects(myJson, "moreResults", myJson.length, 'name');
                createLinkFromList();
            } else {
                state = myJson[0];
            }

            // pokud je zvolena jedna konkretni zeme, pak...
            if (state != null) {
                // vypis dat z REST API do HTML stránky
                state_nativeName.innerHTML = state.nativeName;
                state_name.innerHTML = state.name;
                state_flag.src = state.flag;
                state_code.innerHTML = state.alpha2Code;
                state_code.append(', ' + state.alpha3Code);
                printArray(state.borders, "state_borders");
                state_capital.innerHTML = state.capital;
                state_area.innerHTML = state.area.toLocaleString() + ' km&sup2';
                printArrayOfObjects(state.currencies, "state_currency", state.currencies.length, 'code');
                state_population.innerHTML = state.population.toLocaleString();
                printArrayOfObjects(state.languages, "state_languages", state.languages.length, 'name');
                printArrayOfObjects(state.regionalBlocs, "state_regionalBlocs", state.regionalBlocs.length, 'name');
                printArray(state.topLevelDomain, "state_domain");
                printArray(state.callingCodes, "state_calling");
                state_region.innerHTML = state.region;
                printArray(state.timezones, "state_timezones");

                // zobrazeni tlacitka pro odebrani z oblibenych
                if (favouritesArray.includes(state.name)) {
                    button_favouritesRemove.style.display = 'inline';
                    button_favouritesRemove.disabled = 0;
                }else{
                    button_favouritesRemove.disabled = 1;
                }

                //zobrazeni vysledku hledani a presunuti se na nej
                vysledek.style.display = 'flex';
                location.href = "#";
                location.href = "#vysledek";

                // Pokud podporuje prohlizec local storage...
                if (typeof (Storage) !== "undefined") {

                    // vlozeni do pole historie na prvni index
                    historyArray.unshift(state.name);

                    // ulozeni stringu s daty do uloziste
                    historyString = historyArray.join();
                    localStorage.setItem('history', historyString);

                    // zobrazeni posledniho pridaneho prvku
                    printLocalStorage(historyArray, 'historyInput', 0);
                } else {
                    document.getElementById("historyInput").innerHTML = "Sorry, your browser does not support Web Storage...";
                }

                createLinkFromList();
            }
        })
        .catch(function (error) {
            notFoundAlert.style.display = 'inline';
            console.log(error);
        })
        ;
};


// funkce pro pridani do oblibenych
button_favourites.onclick = function () {


    // nastaveni tlacitka pro odebrani z oblibenych na disabled
    button_favouritesRemove.disabled = 0;

    // Pokud podporuje prohlizec local storage...
    if (typeof (Storage) !== "undefined") {
        var tmpPrint = false;

        // vlozeni do pole oblibenych na prvni index pokud jiz neni obsazeno v oblibenych
        if (localStorage.getItem("favourites") !== null) {
            favouritesString = localStorage.getItem("favourites");
            favouritesArray = favouritesString.split(',');
            var tmp = favouritesArray.includes(state.name);
            if (tmp == false) {
                favouritesArray.unshift(state.name);
                tmpPrint = true;
            }
        } else {
            favouritesArray.unshift(state.name);
            tmpPrint = true;
        }

        // ulozeni stringu s daty do uloziste
        favouritesString = favouritesArray.join();
        localStorage.setItem('favourites', favouritesString);

        if (tmpPrint == true) {
            // zobrazeni posledniho pridaneho prvku
            printLocalStorage(favouritesArray, 'favouritesInput', 0);
        } else {
            alredyExistAlert.style.display = 'inline';
        }

    } else {
        document.getElementById("favouritesInput").innerHTML = "Sorry, your browser does not support Web Storage...";
    }

    createLinkFromList();
};

// funkce pro odebrani z oblibenych
button_favouritesRemove.onclick = function () {

    // nstaveni tlacitek pro oblibene
    alredyExistAlert.style.display = 'none';
    button_favouritesRemove.disabled = 'true';

    // pokud je polozka v poli oblibenych, pak ji bude mozne odstranit
    if (favouritesArray.indexOf(state_name.innerHTML) >= 0) {

        // odstraneni polozky z pole
        favouritesArray.splice(favouritesArray.indexOf(state_name.innerHTML), 1);

        // Pokud podporuje prohlizec local storage...
        if (typeof (Storage) !== "undefined") {

            // ulozeni stringu s daty do uloziste
            favouritesString = favouritesArray.join();
            localStorage.setItem('favourites', favouritesString);

            // odstraneni stareho vypisu oblibenych pred vypsanim znovu
            var favouritesList = document.querySelectorAll('#favouritesInput li');
            for (var i = 0; li = favouritesList[i]; i++) {
                li.parentNode.removeChild(li);
            }

            // novy vypis oblibenych
            for (var i = favouritesArray.length - 1; i >= 0; --i) {
                printLocalStorage(favouritesArray, 'favouritesInput', i);
            }
            createLinkFromList();

        } else {
            document.getElementById("favouritesInput").innerHTML = "Sorry, your browser does not support Web Storage...";
        }
    }
}

