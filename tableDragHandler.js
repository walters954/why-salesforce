let table;
let ul;
let container;
let closestTag;
let dragSrcEl = null;

function handleDragStart(e) {
    /*dragSrcEl = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML);*/
    // Check if the dragged element is an icon (or any other specific element) within the row
    if (e.target.dataset.draggable === "true") {
        e.target.style.cursor = "grabbing";
        dragSrcEl = e.target.closest(closestTag); // Find the dragged row
        //dragger = e.target;
        e.dataTransfer.effectAllowed = "move";
        //e.dataTransfer.setData("text/html", this.innerHTML);
        e.dataTransfer.setData("text/html", dragSrcEl);
        //document.body.classList.add('dragging');
    } else {
        // Prevent dragging if the dragged element is not the specified element
        e.preventDefault();
    }
}

function handleDragOver(e) {
    e.preventDefault();

    // Highlight the target td where the dragged td will be inserted
    /*const targetTd = e.target;
    targetTd.classList.add('highlight');
    
    // Remove highlight from all other tds
    const tds = Array.from(targetTd.parentNode.children);
    tds.forEach(td => {
        if (td !== targetTd) {
            td.classList.remove('highlight');
        }
    });*/

    e.dataTransfer.dropEffect = "move";
    return false;
}

function handleDrag(e) {
}

function handleDragEnd(e) {
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    //document.body.classList.remove('dragging');
    const targetRow = e.target.parentNode; // Get the target row

    if (dragSrcEl != this && targetRow.tagName.toLowerCase() == closestTag) {
        // Swap the positions of the dragged row and the target row
        const parent = targetRow.parentNode; // Get the parent node (tbody)
        const targetIndex = [...parent.children].indexOf(targetRow); // Get the index of the target row
        const dragSrcIndex = [...parent.children].indexOf(dragSrcEl); // Get the index of the dragged row

        if (targetIndex > dragSrcIndex) {
            // If the target row is after the dragged row, insert the dragged row before the target row
            parent.insertBefore(dragSrcEl, targetRow);
        } else {
            // If the target row is before the dragged row, insert the dragged row after the target row
            parent.insertBefore(dragSrcEl, targetRow.nextSibling);
        }

        e.target.style.cursor = "grab";
        window.postMessage({"what": "order"}, "*");
    }
    return false;
}

function createListeners(){
    container.addEventListener("dragstart", handleDragStart, false);// when dragging begins
    container.addEventListener("drag", handleDrag, false);// while it is being dragged
    container.addEventListener("dragover", handleDragOver, false);// while over a valid target
    container.addEventListener("dragend", handleDragEnd, false);// when mouse released
    container.addEventListener("drop", handleDrop, false);// when element is dropped
}

function setup(){
    table = document.getElementById("sortable-table");
    ul = document.getElementsByClassName("tabBarItems slds-grid")[0];
    container = table || ul;
    closestTag = table != null ? "tr" : "li";
    if(container != null)
        createListeners();
    else setTimeout(() => setup(), 500);
}

setup()
