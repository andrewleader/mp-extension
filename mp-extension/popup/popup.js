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
  var gearStrings = info.gearStrings;
  
  info.gearComments.forEach(c => {
    var p = formatParagraph(c.text, gearStrings);

    gearDiv.appendChild(p);
  });

  header.innerText = "Loaded!";
}

var formatParagraph = (txt, searchStrings) => {
  var p = document.createElement("p");

  const words = txt.split(" ");

  const wordsWithFormatting = [];
  words.forEach(w => {
    wordsWithFormatting.push({
      word: w,
      isBold: false
    });
  });

  var index = 0;
  for (; index < wordsWithFormatting.length; index++) {
    var w = wordsWithFormatting[index];
    if (!w.isBold) {
      if (matches(w.word, searchStrings)) {
        w.isBold = true;
        for (var i = index - 1; i >= 0 && i >= index - 5; i--) {
          wordsWithFormatting[i].isBold = true;
        }
        for (var i = index + 1; i < wordsWithFormatting.length && i <= index + 5; i++) {
          wordsWithFormatting[i].isBold = true;
        }
      }
    }
  }

  wordsWithFormatting.forEach(w => {
    var element;
    if (w.isBold) {
      element = document.createElement("strong");
      element.textContent = w.word;
    } else {
      element = document.createTextNode(w.word);
    }
    p.appendChild(element);
    p.appendChild(document.createTextNode(" "));
  });

  return p;
}

var matches = (str, searchStrings) => {
  var match = false;
  searchStrings.forEach(searchStr => {
    if (str.includes(searchStr)) {
      match = true;
    }
  });
  return match;
}

chrome.tabs.query(tabQuery, tabCallback);