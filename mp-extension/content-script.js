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
  var comments = getComments();

  var info = {
    gearComments: getGearComments(comments),
    gearStrings: gearStrings
  };

  return info;
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
  "single"
]

function getGearComments(comments) {
  return getMatchingComments(comments, gearStrings);
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