// used for getting urls from options
var allUrlsString="";
var url = "url not set";
var finalTimer = "";
var yesNo=true;
var timeLeftInSeconds=0;

// set end of timer certain amount of time away from now
function startTimer(duration, display) {      // duration is in seconds, display is document.querySelector('#time')
    var timer = duration, minutes, seconds;
    setInterval(function () {
        timeLeftInSeconds = timer;
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        finalTimer= minutes+" : "+seconds;

        if (--timer < 0) {
            timer = 0;
        }
    }, 1000);
}


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message.method == "getTimerMessage"){
    sendResponse(finalTimer);
    return true;
  }
});

// gets timer value set in options
function setTimerAmount(){
    chrome.storage.local.get('key', function(data) {
        try{
	var temp = data.key;
        if (temp == "10 minutes"){
          startTimer(10*60, document.querySelector('#time'));
        }
        else if (temp == "30 minutes"){
          startTimer(30*60, document.querySelector('#time'));
        }
        else if (temp == "1 hour"){
	  startTimer(60*60, document.querySelector('#time'));
        }
        else if (temp == "2 hours"){
	  startTimer(120*60, document.querySelector('#time'));
        }
        else if (temp == "timer not set"){
          finalTimer= "timer not set";
        }
        chrome.storage.local.set({key: ""}, function() {
          console.log('timer is cleared');
        })
        } 
        catch (error){
          console.log("error");
        }
    });
}

// gets list of blocked urls from options
function setUrl(){
  chrome.storage.local.get('chosenUrls', function(data) {
    try{
      allUrlsString = data.chosenUrls;
    } 
    catch (error){
      console.log("error here");
    }
  });
}

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message.method == "getUrlNow"){
    if (allUrlsString==null){
      sendResponse("");
    }
    else{
      sendResponse(allUrlsString);
    }
    return true;
  }
});

var x = setInterval(function() {
    // gets timer and url values set in options
    setTimerAmount();
    setUrl();
    if (timeLeftInSeconds != 0){
    													
    var urls = [];
    // splits allUrlsString into each url and adds to storeUrls array
    var startPos = 0;
    for (var x=0; x<allUrlsString.length;x++){
      if (x==allUrlsString.length-2){
        urls.push(allUrlsString.substring(startPos));
        break;
      }
      else if (allUrlsString.substring(x,x+2)==", "){
        urls.push(allUrlsString.substring(startPos, x));
        startPos=x+2;                                                               
      }
    }
    //var urls = JSON.parse(storeUrls);
    activeTab();

    // if active tab is not specified website, the end date will increase like
    // a normal clock to simulate a paused timer
    // rightUrl stores whether url matches one of the specified urls
    var rightUrl = false;
    for (var x=0; x<urls.length; x++){
      if (url.indexOf(urls[x])>-1) {
        rightUrl=true;
        x=100;
      }
    }
    if (rightUrl==false){
      startTimer(timeLeftInSeconds,document.querySelector('#time'));
    }

    // times up, yo
    if (rightUrl == true && yesNo==true && timeLeftInSeconds==0)
    {
      //alert("Time's up! Close tab now?");
      if (confirm("Time's up! Close tab now?")) {
        yesNo = remove();
        startTimer(2,document.querySelector('#time'));
      } 
      else {
        alert("Snoozed for 10 minutes");
        startTimer(600,document.querySelector('#time'));
      }
    }
    else if (yesNo==false){
      yesNo=true;
    }

    // updates timer element on popup
    finalTimer = "Time remaining: "+timeLeftInSeconds;
    }
    else {
      finalTimer = "timer not set";
    }
}, 1000);

// finds active tab url
function activeTab (){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       	url = tabs[0].url; 
    });
}    

// removes active tab
function remove(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.remove(tabs[0].id); 
          return true; 
        });
        return false;
}

chrome.runtime.onInstalled.addListener(function() {

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
            //pageUrl: {hostEquals: 'www.youtube.com'},
        })
        ],
	    actions: [new chrome.declarativeContent.ShowPageAction()],	
      }]);
    });
  });
