console.log('IS THIS WORKING?');

// Open the indexedDB
const request = window.indexedDB.open("budget", 4);

let db;

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoincrement: true });
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

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    console.log("transaction: ", transaction);
    console.log("store: ", store);
    console.log("record: ", record);
    store.add(record);
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

window.addEventListener("online", checkDatabase);