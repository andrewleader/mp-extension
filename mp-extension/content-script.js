chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.operation == "getInfo") {
      // Can send back any valid JSON
      sendResponse(getInfo());
    } else if (request.operation == "search") {
      sendResponse(search(request.text));
    }
  }
)

function search(text) {
  var comments = getComments();

  var info = {
    text: text,
    comments: getMatchingComments(comments, [ text ])
  };
  
  return info;
}

function getInfo() {
  try
  {
    var comments = getComments();

    var info = {
      gearComments: getGearComments(comments),
      gearStrings: gearStrings,
      keywordCounts: getKeywordCounts(comments)
    };

    return info;
  } catch (e) {
    return {
      error: e.toString()
    };
  }
}

function getKeywordCounts(comments) {
  var keywordCounts = [
    getKeywordCount(comments, [ "slab", "slabby" ]),
    getKeywordCount(comments, [ "overhang" ]),
    getKeywordCount(comments, [ "traverse", "traversing" ]),
    getKeywordCount(comments, [ "runout" ])
  ];

  keywordCounts.sort((a, b) => b[1] - a[1]);
  return keywordCounts;
}

function getKeywordCount(comments, keywords) {
  return [ keywords[0], getCommentsMatchingKeywords(comments, keywords).length ];
}

const gearStrings = [
  "cam",
  "gear",
  "#",
  ".0",
  ".1",
  ".2",
  ".3", ".4", ".5", ".75",
  "nut",
  "sling",
  "draw",
  "double",
  "single",
  "triple"
]

function getGearComments(comments) {
  return getMatchingComments(comments, gearStrings);
}

function getCommentsMatchingKeywords(comments, keywords) {
  var matchingComments = [];
  comments.forEach(comment => {
    for (var i = 0; i < keywords.length; i++) {
      if (includesKeyword(comment.text, keywords[i])) {
        matchingComments.push(comment);
        break;
      }
    }
  });
  return matchingComments;
}

function includesKeyword(txt, keyword) {
  txt = txt.toLowerCase();
  keyword = keyword.toLowerCase();

  var split = splitIntoKeywords(txt);
  for (var i = 0; i < split.length; i++) {
    var word = split[i];
    if (word === keyword) {
      return true;
    }
    if (word.endsWith("s")) {
      if (word.substring(0, word.length - 1) == keyword) {
        return true;
      }
    }
    if (word.endsWith("ing")) {
      if (word.substring(0, word.length - 3) == keyword) {
        return true;
      }
    }
    if (word.endsWith("ed")) {
      if (word.substring(0, word.length - 2) == keyword) {
        return true;
      }
    }
    if (word.endsWith("'s")) {
      if (word.substring(0, word.length - 2) == keyword) {
        return true;
      }
    }
  }

  return false;
}

function getMatchingComments(comments, searchStrings) {
  var matchingComments = [];
  comments.forEach(comment => {
    if (includesText(comment.text, searchStrings)) {
      matchingComments.push(comment);
    }
  });
  return matchingComments;
}

function includesText(toSearch, terms) {
  var found = false;
  terms.forEach(t => {
    if (toSearch.toLowerCase().includes(t)) {
      found = true;
    }
  });
  return found;
}

function splitIntoKeywords(str) {
	const regex = /#?\d+(?:\.\d+)?(?!\w)|#?\.\d+(?!\w)|[\w']+/g;
  var matches = str.match(regex);
  if (matches === null) {
  	return [];
  } else {
  	return matches;
  }
}

function getComments() {
  const nodes = document.getElementsByClassName("main-comment");
  const comments = [];

  Array.prototype.forEach.call(nodes, node => {

    var userLink = node.querySelectorAll("div.bio a");
    var userName = userLink[0].innerText;

    // Make sure we grab the span with the "full" name in its ID
    var commentBodySpans = node.querySelectorAll(".comment-body span");
    var commentText = "";
    commentBodySpans.forEach(span => {
      if (span.id.includes("full")) {
        commentText = span.innerText;
      }
    });

    comments.push({
      name: userName,
      text: commentText
    });
  });

  comments.reverse();

  const potentialTickHeaders = document.getElementsByTagName("h3");
  Array.prototype.forEach.call(potentialTickHeaders, pth => {
    if (pth.innerText.includes("Ticks")) {
      var ticks = pth.parentElement.querySelectorAll("tr");
      ticks.forEach(t => {
        var userName = t.children[0].innerText;
        var text = t.children[1].innerText;

        var indexOfStart = text.indexOf(" · ");
        if (indexOfStart > 0) {
          text = text.substring(indexOfStart + 3);

          comments.push({
            name: userName,
            text: text
          });
        }
      });
    }
  });

  return comments;
}

function findNodesContainingText(searchText) {
  const nodes = document.querySelectorAll("*");
  const nodesContainingText = [];

  nodes.forEach((node) => {
    if (node.innerText.toLowerCase().includes(searchText.toLowerCase())) {
      nodesContainingText.push(node);
    }
  });

  return nodesContainingText;
}