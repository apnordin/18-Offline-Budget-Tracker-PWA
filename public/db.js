console.log('IS THIS WORKING?');

// Fixed error of inability to add on IDBObject Store by referencing this: https://www.raymondcamden.com/2012/04/26/Sample-of-IndexedDB-with-Autogenerating-Keys

let db;

// Open the indexedDB
const request = window.indexedDB.open("budget", 6);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    }
}

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

window.addEventListener("online", checkDatabase);

