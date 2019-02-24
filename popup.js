let basicUsage = document.getElementById('basicUsage');

var x = setInterval(function() {

// recieving response (time left)
chrome.runtime.sendMessage({method:"getTimerMessage"},function(response){
  //here response will be the word you want
  document.getElementById("basicUsage").innerHTML = response;
});

}, 1000);   

// options button
let options = document.getElementById('options');
options.innerHTML = "Options";
options.onclick = function(element) {	
  chrome.tabs.create({'url': "/options.html" });
};
