// Header
var header = document.createElement("th");
header.scope = "col";
var txt = document.createTextNode("Plus Plus");
header.appendChild(txt);
document.getElementsByClassName("rwd-table results")[0].firstChild.nextSibling.firstChild.nextSibling.appendChild(header);

// Icon
var longhorn;
var pic;
var i;
var info = document.getElementsByClassName("rwd-table results")[0].firstChild.nextSibling.nextSibling.nextSibling;
var cur;
for (i = 0; i < info.children.length; i++) {

    // Attach image to longhorn button
    longhorn = document.createElement("td");
    longhorn.style.cssText = "color: rgb(51, 51, 51); text-decoration: none; font-weight: normal";
    pic = document.createElement("input");
    pic.type = "image";
    pic.id = "ourButton";
    pic.width = "40";
    pic.height = "20";
    pic.src = "https://i.imgur.com/bThluov.png";
    longhorn.appendChild(pic);

    // Append button to document
    cur = info.children[i];
    if (cur.firstChild.nextSibling.className != "course_header") {
        cur.appendChild(longhorn);
    }
}

// Event listener for click
document.getElementById("ourButton").addEventListener("click", getOptions());

// Function for options popup
function getOptions() { 
}