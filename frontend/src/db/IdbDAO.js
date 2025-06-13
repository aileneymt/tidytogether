import { openDB } from 'idb';

const DB_NAME = 'TidyTogether';
const DB_VERSION = 1;
const STORE_NAMES = ['task', 'user_task'];

let db;

async function initDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        STORE_NAMES.forEach((name) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name);
          }
        });
      }
    });
  }
}

// Generic functions that take a store name
export async function putItem(store, key, value) {
  await initDB();
  return db.put(store, value, key);
}

export async function getAllItems(store) {
  await initDB();
  return db.getAll(store);
}

export async function getItem(store, key) {
  await initDB();
  return db.get(store, key);
}

export async function deleteItem(store, key) {
  await initDB();
  return db.delete(store, key);
}

export async function clearStore(store) {
  await initDB();
  return db.clear(store);
}


/**

Example USAGE in React App:


import { putItem, getAllItems } from './db/IdbDAO';

await putItem('notes', 'note-1', {
  text: 'This is a note',
  createdAt: Date.now()
});

const allNotes = await getAllItems('notes');
console.log(allNotes);


Put in IndexedDB will add OR update existing item (no post/put differentiation)



 */
