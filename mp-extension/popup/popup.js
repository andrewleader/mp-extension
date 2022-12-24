var header = document.getElementById("header");


var requestInfo = async (message) => {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  const response = await chrome.tabs.sendMessage(tab.id, message);
  return response;
}

var search = async () => {
  var searchDiv = document.getElementById("searchDiv");
  try {
    var searchInput = document.getElementById("searchInput");
    var searchText = searchInput.value;
    searchDiv.innerHTML = "";

    var searchResults = await requestInfo({
      operation: "search",
      text: searchText
    });

    displaySearchResults(searchResults);
  } catch (e) { searchDiv.innerText = "Error: " + e; }
  return false;
}

document.getElementById("searchButton").onclick = search;

var displaySearchResults = (info) => {
  var searchDiv = document.getElementById("searchDiv");
  try {
    searchDiv.innerHTML = "";

    info.comments.forEach(c => {
      var p = formatParagraph(c.text, [ info.text ]);

      searchDiv.appendChild(p);
    });

    if (info.comments.length == 0) {
      searchDiv.innerText = "Nothing found";
    }
  } catch (e) {searchDiv.innerText = "Error displaying: " + e;}
}

var onGotInfo = (info) =>
{
  try {
    var gearDiv = document.getElementById("gearDiv");
    var gearStrings = info.gearStrings;
    
    info.gearComments.forEach(c => {
      var p = formatParagraph(c.text, gearStrings);

      gearDiv.appendChild(p);
    });

    header.innerText = "Loaded!";
  } catch {}
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

(async () => {
  try {
  var info = await requestInfo({ operation: "getInfo" });
  onGotInfo(info);
  } catch {}
})();
