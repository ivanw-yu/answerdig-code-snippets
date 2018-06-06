// maybe fix this later, see what other words shouldn't be capitalized
var dontCapitalize = ['an', 'a', 'for', 'the', 'or', 'but', 'and', 'so',
                      'to', 'nor', 'till', 'when', 'yet', 'as', 'than', 'that', 'is',
                      'this'];

module.exports.capitalizeFirstInTitles = function(string){
  var splitString = splitOnSpace(string);
  if(splitString.length ==0){
    return "";
  }
  splitString = splitString.map((element, index) => {
    return ( index == 0 || index == splitString.length) ||  (dontCapitalize.indexOf(element) < 0)
            ? capitalizeFirst(element) : element;
  });
  return splitString.join(' ');
}

module.exports.capitalizeSentenceStart =  function(string){
  if(string.indexOf(".") > 0){
    var splitString = splitOnPeriod(string);
    splitString = splitString.map( (element) => {
      return (element != undefined && element.trim().length > 0) ? capitalizeFirst(element.trim()) : element;
    });
    return splitString.join('. ');
  }else{
    return (string != undefined && string.trim().length > 0) ? capitalizeFirst(string.trim()) : string;
  }
}

module.exports.capitalizeFirstLowerCaseElse = function(string){
  if(string == undefined || string.trim().length ==0){
    return '';
  }else{
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
}

function capitalizeFirst(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function splitOnSpace(string){
  if(string == undefined){
    return [];
  }
  return string.trim().split(/[ ]+/);
}

// splits on ., .., ..., etc.
function splitOnPeriod(string){
  return string.trim().split(/[\\.]+/);
}

module.exports.capitalizeFirst = capitalizeFirst;
