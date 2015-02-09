var fs=require("fs");
var pedurma=JSON.parse(fs.readFileSync("./jPedurma.json","utf8"));
var han=1;
var out=[];
//判斷函號有沒有改變，如果沒有就進行下一比，有的話就pus其結束頁

for(var i=0; i<pedurma.length; i++){
	if(pedurma[i][0] != han){
		han=pedurma[i][0];
		//console.log(pedurma[i-1]);
		var range=pedurma[i-1][1].split("-");
		var vol=range[0].substr(0,range[0].indexOf("@"));
		out.push([pedurma[i-1][0],vol+"@"+range[1]]);
		if(i==pedurma.length-1) {
			var r=pedurma[i][1].split("-");
			var v=r[0].substr(0,r[0].indexOf("@"));
			out.push([pedurma[i][0],v+"@"+r[1]]);
		}
	}
}


console.log(out);