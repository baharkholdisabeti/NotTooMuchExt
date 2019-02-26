// used for getting urls from options
var allUrlsString="";
var url = "url not set";
var countdown = "Timer not set";
var seconds=100000;
var justRemoved = false;
var oldDate = new Date();
var lastSec=100000; // for reseting the day

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message.method == "getTimerMessage"){
    sendResponse(countdown);
    return true;
  }
});

// find out if it's a new day (to know whether or not to reset timer)
function isSameDay() {
    return (new Date()).toDateString() == oldDate.toDateString();
}

// gets timer value set in options
function setTimerAmount(){
    chrome.storage.local.get('key', function(data) {
        try{
	  var temp = data.key;
          	if (temp == "10 minutes"){ 
	    		seconds=600;
			lastSec=600;
	    		setTimer();
	  	}
	  	else if (temp == "30 minutes"){ 
	    		seconds=1800;
			lastSec=1800;
	    		setTimer();
	  	}
	  	else if (temp == "1 hour"){ 
	    		seconds=3600;
			lastSec=3600;
	    		setTimer();
	  	}
	  	else if (temp == "2 hours"){ 
	    		seconds=7200;
			lastSec=7200;
	    		setTimer();
	  	}
          	else if (temp == "timer not set"){
	    		seconds=100000;
			lastSec=100000;
            		countdown= "Timer not set";
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


// sets countdown clock
function setTimer(){
  var hours       = Math.floor(seconds/3600);
  var minutesLeft = Math.floor((seconds) - (hours*3600));
  var minutes     = Math.floor(minutesLeft/60);
  var remainingSeconds = seconds % 60;
  function pad(n) {
    return (n < 10 ? "0" + n : n);
  }
  countdown = "Time left: "+pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds);
  if (seconds == 0) {
    clearInterval(countdownTimer);
  } else {
    seconds--;
  }
}

// time's up popup
function confirmPopup(){
	if (confirm("Your time's up! Click ok to close the tab or cancel to snooze for 10 more minutes.")) {
    		remove();
		justRemoved=true;
	} else {
    		seconds=600;
	    	setTimer();
	}
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

// main!!!
var x = setInterval(function() {
	setUrl();
	activeTab();
	setTimerAmount();
	var line = allUrlsString.split(", ");
	for (var y=0;y<line.length;y++){
	    if (url.indexOf(line[y])>-1){
		if (seconds==0 && justRemoved==false){
			confirmPopup();
		}
		else if (justRemoved==true){
			justRemoved=false;
		}
		if (seconds!=100000){
			setTimer();
		}
		y=10000;
	    }
	}
	// check if it's a new day
	if (!isSameDay()){
		oldDate=new Date();
		seconds=lastSec;
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
