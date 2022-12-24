var enhancePage = () => {
  console.log("Making red");
  document.body.style.backgroundColor = 'red';

  const nodes = document.getElementsByClassName("main-comment");
  const comments = [];

  alert(nodes.length);

  Array.prototype.forEach.call(nodes, node => {
    var userLink = node.querySelectorAll("div.bio a");
    var userName = userLink[0].innerText;

    // Make sure we grab the span with the "full" name in its ID
    var commentBodySpans = node.querySelectorAll(".comment-body span");
    var comment = "";
    commentBodySpans.forEach(span => {
      if (span.id.contains("full")) {
        comment = span.innerText;
      }
    });

    alert(comment);

    comments.push({
      name: userName,
      comment: comment
    });
  });

  var pNodes = document.getElementsByTagName("p");
  Array.prototype.forEach.call(pNodes, p => {
    p.innerText = "Modified" + p.innerText;
  });
}

chrome.action.onClicked.addListener((tab) => {
  if(tab.url.includes("mountainproject.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: enhancePage
    });
  }
});

