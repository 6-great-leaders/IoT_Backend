// sortGroceriesList: Sorts the groceries list by the x coordinate of the grocery items
function sortGroceriesList(l) {
    const copiedList = [...l];
    copiedList.sort((a, b) => a.x - b.x);
    return copiedList;
}

module.exports = {sortGroceriesList};