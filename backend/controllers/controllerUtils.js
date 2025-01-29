// sortGroceriesList: Sorts the groceries list by the y coordinate of the grocery items in ascending order
function sortGroceriesList(l) {
    const copiedList = [...l];
    copiedList.sort((a, b) => a.y - b.y);
    return copiedList;
}

module.exports = {sortGroceriesList};