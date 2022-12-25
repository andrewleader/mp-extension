var header = document.getElementById("header");
var searchInput = document.getElementById("searchInput");
var searchDiv = document.getElementById("searchDiv");


var requestInfo = async (message) => {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  const response = await chrome.tabs.sendMessage(tab.id, message);
  return response;
}

var search = async () => {
  try {
    var searchText = searchInput.value.toLowerCase();
    searchDiv.innerHTML = "";

    var searchResults = await requestInfo({
      operation: "search",
      text: searchText
    });

    displaySearchResults(searchResults);
  } catch (e) { searchDiv.innerText = "Error: " + e; }
  return false;
}

var searchWithString = async (searchText) => {
  searchInput.value = searchText;
  await search();
}

var clearSearch = () => {
  searchInput.value = "";
  searchDiv.innerHTML = "";
};

document.getElementById("searchButton").onclick = search;
document.getElementById("clearButton").onclick = clearSearch;

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
  var gearDiv = document.getElementById("gearDiv");
  try {
    var keywordsDiv = document.getElementById("keywordsDiv");
    var keywordCounts = info.keywordCounts;
    keywordCounts.forEach(c => {
      var el = document.createElement("a");
      el.innerText = c[0] + ": " + c[1];
      el.onclick = () => {
        searchWithString(c[0]);
      };
      keywordsDiv.appendChild(el);
    });

    var gearStrings = info.gearStrings;
    
    info.gearComments.forEach(c => {
      var p = formatParagraph(c.text, gearStrings);

      gearDiv.appendChild(p);
    });

    header.innerText = "Loaded!";
  } catch (e) { gearDiv.innerText = e + "\n\n" + JSON.stringify(info); }
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
  str = str.toLowerCase();
  var match = false;
  searchStrings.forEach(searchStr => {
    if (str.includes(searchStr.toLowerCase())) {
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
