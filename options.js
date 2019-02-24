let page = document.getElementById('buttonDiv');
  const kButtonTimes = ['10 minutes', '30 minutes', '1 hour', '2 hours'];
  function constructOptions(kButtonTimes) {
    for (let item of kButtonTimes) {
      let button = document.createElement('button');
      button.innerHTML = item;
      button.addEventListener('click', function() {
        chrome.storage.local.set({key: item}, function() {
          console.log('timer is set for ' + item);
        })
      });
      page.appendChild(button);
    }
  }
  constructOptions(kButtonTimes);

let enableDisable = document.getElementById('enableDisable');
enableDisable.innerHTML="Disable Timer";
enableDisable.onclick = function(element) {
  chrome.storage.local.set({key: 'timer not set'}, function() {
    console.log('timer is disabled');
  })
}

var allUrls = "";
// get url
//getUrlNow();
chrome.runtime.sendMessage({method:"getUrlNow"},function(response){
  //here response will be the word you want
  allUrls = response;
  document.getElementById("demo").innerHTML = "Chosen URLs: " + allUrls;
});
let errorMessage = document.getElementById('errorMessage');
let getUrls = document.getElementById('getUrls');
getUrls.innerHTML="Submit entry";
getUrls.onclick = function(element) {
  var x = document.getElementById("frm1");
  var text = x.elements[0].value;
  if (text.indexOf(" ")==-1 && text.indexOf(".")>-1){
    if (allUrls.indexOf(text)>-1){
      if (allUrls.indexOf(text)==0){
        allUrls = allUrls.substring(allUrls.indexOf(text)+2+text.length);
      }
      else if (allUrls.indexOf(text)!=0 && allUrls.indexOf(text)+text.length!=allUrls.length){
        var tempUrls = allUrls;
        var tempUrlHalf = "";
        var erase = false;
        while (tempUrls.indexOf(text)>-1){
          var tempIndex = tempUrls.indexOf(text);
          if (tempUrls.substring(tempIndex-1, tempIndex)==" " && tempUrls.substring(tempIndex+text.length, tempIndex+text.length+2)==", "){
            allUrls = tempUrlHalf + tempUrls.substring(0, tempUrls.indexOf(text)-2) + tempUrls.substring(tempUrls.indexOf(text)+text.length);
            erase = true;
            break;
          }
          tempUrls = tempUrls.substring(tempIndex+text.length);
          tempUrlHalf = tempUrlHalf + tempUrls.substring(0,tempIndex);
        }
        if (erase == false){
          if (allUrls.length!=0){
            allUrls = allUrls + ", " + text;
          }
          else{
            allUrls = text;
          }
        }
      }
      else if (allUrls.indexOf(text)+text.length==allUrls.length){
        var tempUrls = allUrls;
        var tempUrlHalf = "";
        var erase = false;
        while (tempUrls.indexOf(text)>-1){
          var tempIndex = tempUrls.indexOf(text);
          if (tempUrls.substring(tempIndex-1, tempIndex)==" "){
            allUrls = tempUrlHalf + tempUrls.substring(0, tempUrls.indexOf(text)-2);
            erase = true;
            break;
          }
          tempUrls = tempUrls.substring(tempIndex+text.length);
          tempUrlHalf = tempUrlHalf + tempUrls.substring(0,tempIndex);
        }
        if (erase == false){
          if (allUrls.length!=0){
            allUrls = allUrls + ", " + text;
          }
          else{
            allUrls = text;
          }
        }
      }
      document.getElementById("errorMessage").innerHTML = "";
    }
    else{
      if (allUrls.length!=0){
        allUrls = allUrls + ", " + text;
      }
      else{
        allUrls = text;
      }
      document.getElementById("errorMessage").innerHTML = "";
    }
    setUrlNow();
  }
  else{
    document.getElementById("errorMessage").innerHTML = "Error: invalid URL. Please re-enter.";
  } 
  document.getElementById("demo").innerHTML = "Chosen URLs: "+allUrls; 
}

function setUrlNow(){
    chrome.storage.local.set({chosenUrls: allUrls}, function() {
    })
}
