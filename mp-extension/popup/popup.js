var header = document.getElementById("header");

var tabQuery = { active: true, currentWindow: true };

var tabCallback = (tabs) => {
  var currentTab = tabs[0]; // there will be only one in this array
  if (!currentTab.url.includes("mountainproject.com"))
  {
    header.innerText = "Only works on mountainproject.com";
  }
  else
  {
    header.innerText = "Getting DOM...";

    chrome.tabs.sendMessage(currentTab.id, { operation: "getInfo" }, onGotInfo);
  }
}

var onGotInfo = (info) =>
{
  var gearDiv = document.getElementById("gearDiv");
  
  info.gearComments.forEach(c => {
    var p = document.createElement("p");
    p.innerText = c.text;
    gearDiv.appendChild(p);
  });
  
  header.innerText = "Loaded!";
}

chrome.tabs.query(tabQuery, tabCallback);