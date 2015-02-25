var entries=require("./entries.js");
var mahavyutpatti=require("./mahavyutpatti.js");
var indexes=require("./indexes.js");

var indexOfSorted=function (array, obj) { 
    var low = 0,
    high = array.length-1;
    while (low < high) {
      var mid = (low + high) >> 1;
      array[mid] < obj ? low = mid + 1 : high = mid;
    }
    if(array[low] != obj) return null;
    return low;
 }
var exhaustiveFind=function(tofind) {
    var out=[];
    var f=tofind.split(/[་།]/);
    for(var i=0; i<f.length; i++){
      if(f[i]){
        for(var j=i+1;j<f.length; j++){
          var term=[];
          term.push(f[i]);
          for(var k=i+1; k<j; k++){
            term.push(f[k]);
          }
          var index=indexOfSorted(entries,term.join("་")+"་");
          if(index) out.push(mahavyutpatti[indexes[index]]);
        }
      }
    }
    //out.length != 0 ? this.setState({tofind:tofind,def:out}) : this.setState({tofind:tofind,def:null});
    //console.log(out);
    return out;
 }


var dict_api={exhaustiveFind:exhaustiveFind};
module.exports=dict_api;