var searchSutra=function(tofind,toc){
	var out=[];
	try {
		var reg=new RegExp(tofind,"g"); //this might throw
		toc.map(function(item){
			if(item.depth==3 && item.text.match(reg)){
				out.push(item);
			}
		});
		return out;
	} catch (e) {
		console.log(e);
		return out;
	}
}

var searchKacha=function(tofind,toc){
	var out=[];
	try {
		var reg=new RegExp(tofind,"g"); //this might throw
		toc.map(function(item){

			if(item.depth!=3 && item.depth!=0 && item.text.match(reg)){
				out.push(item);
			}
		});
		return out;
	} catch (e) {
		console.log(e);
		return out;
	}
}

var search_api={searchSutra:searchSutra,searchKacha:searchKacha}
module.exports=search_api;