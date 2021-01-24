// Open the indexedDB
const request = window.indexedDB.open(databaseName, 1);

// let db;

// request.onupgradeneeded = function(e) {
//     const db = request.result;
//     db.createObjectStore("pending", { autoincrement: true });
// };

// request.onerror = function(e) {
//     console.log("The following error has occured: ", request.result);
// };

// request.onsuccess = function(e) {
//     db = request.result;
    
//     db.onerror = function(e) {
//         console.log("error");
//     };


// }