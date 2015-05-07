var fs=require("fs");
var pedurma=JSON.parse(fs.readFileSync("./dPedurma.json","utf8"));
var finalpage=JSON.parse(fs.readFileSync("./d_finalpage.json","utf8"));
var out=[];

for(var i=0; i<pedurma.length; i++){
	var start=0;
	var end=0;
	if (pedurma[i][0].match("_")) {
		var jing=pedurma[i][0].substr(0,pedurma[i][0].indexOf("_"));
	} else var jing=pedurma[i][0];
	if (typeof(pedurma[i+1])!="undefined" && pedurma[i+1][0].match("_")) {
		var nextJing=pedurma[i+1][0].substr(0,pedurma[i+1][0].indexOf("_"));
	} else if(typeof(pedurma[i+1])!="undefined") var nextJing=pedurma[i+1][0];

	if(!pedurma[i][1].match("-")){
		if(jing == nextJing){
			start=pedurma[i][1];
			end=pedurma[i+1][1];
		} else {
			start=pedurma[i][1];
			for(var j=0; j<finalpage.length; j++){
				if(parseInt(jing) == finalpage[j][0]){
					end = finalpage[j][1];
					break
				}
			}
			// end=finalpage.map(function(item){
			// 	if(parseInt(jing) == item[0]){
			// 		return item[1];
			// 	}// else return "no end";
			// })
		}

	} else {
		var r=pedurma[i][1].split("-");
		start=r[0];
		end=r[1];
	}

	out.push([pedurma[i][0],start+"-"+end,pedurma[i][2]]);
}

console.log(out);