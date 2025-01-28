function sortGroceriesList(l) {
    const copiedList = [...l]; // Crée une copie de l'array initial
    copiedList.sort((a, b) => a.x - b.x); // Trie la copie
    return copiedList; // Retourne la liste triée
}

module.exports = {sortGroceriesList};