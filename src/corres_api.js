var dosearch=function(volpage,from,to) {
  var tmp=fromVolpage(volpage,from,to);
    //corresFromVolpage= [經號],[範圍],[對照經號],[對照範圍],[對照行],[K經號]
  if(tmp){
	  var parse_tmp=parseVolPage(tmp);
	  var corresPage=snap2realpage(parse_tmp);
	  return corresPage.vol+"."+corresPage.page+corresPage.side;
	} else {
		console.log("no corres page");
		return "";
	}
}

var fromVolpage=function(volpage,from,to){
  //var volpage=document.getElementById("input").value;
  var out=[];
  var range=findRange(volpage,from);//range=[J經號,J範圍,K經號]
  if(range) {
  	var corres_range=findCorresRange(range[2],to);//corres_range=[D經號,D範圍,下一項D經號,下一項D範圍]
  } else return null;
  //算J和D的範圍
  if(corres_range.length != 0 ){
    var vRange=countRange(range[1],range[3],range[0],range[2]);
    //vRange input為D範圍, 下一項D範圍, D經, 下一項D經 //output為[vStart,vEnd-vStart]
    var corres_vRange=countRange(corres_range[0][1],corres_range[corres_range.length-1][1]);//[vStart,vEnd-vStart]
    var corresLine=countCorresLine(volpage,vRange[1],corres_vRange[1],vRange[0],corres_vRange[0]);

    //out.push([range[0]],[range[1]],[corres_range[0][0]],[corres_range[0][1]],[corresLine],[range[2]]);
          // [經號],[範圍],[對照經號],[對照範圍],[對照行],[K經號]
    return corresLine;
  } else return null;
}

var countCorresLine=function(volpage,range,corres_range,start,corres_start){//volpage=使用者輸入的volpage
	var Vline=volpb2vl(volpage);
	var corres_vLine=(range*corres_start+corres_range*(Vline-start))/range;//對照的虛擬行
	corres_vLine=Math.floor(corres_vLine);
	var corresLine=vl2volpb(corres_vLine);//對照的虛擬行轉回volpage
	return corresLine;
}

var countRange=function(Range){//range=034@020a1-103b7
	var m=Range.split("-");
	var start=m[0];
	var vStart=volpb2vl(start);
	if (m[1].match("@")) var end=m[1];
	else {
		var end=start.substr(0,start.indexOf("@")+1)+m[1];
	}
	var vEnd=volpb2vl(end);
	var vRange=[vStart,vEnd-vStart];
	
	return vRange;
}

var findCorresRange=function(KJing,to){
	var out=[];
	for(var i=0; i<to.length; i++){
		if(KJing == to[i][2]){
			out.push([to[i][0],to[i][1]]);
		}
	}
	return out;
}

var findRange=function(volpage,from){
	var out=[];
	var Pedurma=startline2vline(from);
	//將輸入轉為vline，找出此行所在的範圍
	//for(var i=0; i<input.length; i++){}
	var input_vline=volpb2vl(volpage);
	for(var k=0; k<Pedurma.length; k++){
		if(input_vline < Pedurma[k][1]){
			out=from[k-1];//此行所在的範圍的[J經錄,J範圍,K經錄]
			break;
		}
	}
	return out;
}

//Pedurma的起始行轉vline
var startline2vline=function(from){
	var out=[];
	for(var j=0; j<from.length; j++){
		var p=from[j][1].split("-");
		var start=p[0];
		var start_vline=volpb2vl(start);
		out.push([from[j][0],start_vline]);//[經號,起始行的vline]
	}
	return out;
}

var rvp2Vline=function(){
	var out=[];
	var pageRange=rvp2rvp();
	for(var i=0;i<pageRange.length; i++){
		var s=parseVolPage(pageRange[i][1]);
		out.push(s);
	}
	return out;
}

var parseVolPage=function(str){
	var s=str.match(/(\d+)[@.](\d+)([abcd]*)(\d*)/);
	//var s=str.match(/(\d+)[@.](\d+)([abcd])(\d*)-*(\d*)([abcd]*)(\d*)/);
	if(!s){
		console.log("error!",str);
		return null;
	}
	return {vol:parseInt(s[1]),page:parseInt(s[2]),side:s[3] || "x",line:parseInt(s[4]||"1")};
	//return {vol:parseInt(s[1]),page:parseInt(s[2]),side:s[3],line:parseInt(s[4]||"1"),page2:parseInt(s[5]),side2:s[6],line2:parseInt(s[7]||"1")};
}

var parseVolPageRange=function(str){
	var s=str.match(/(\d+)[@.](\d+)([abcd]*)(\d*)-(\d+)([abcd]*)(\d*)/);
	//var s=str.match(/(\d+)[@.](\d+)([abcd])(\d*)-*(\d*)([abcd]*)(\d*)/);
	if(!s){
		console.log("error!",str);
		return null;
	}
	return {vol:parseInt(s[1]),page:parseInt(s[2]),side:s[3] || "x",line:parseInt(s[4]||"1"),page2:parseInt(s[5]),side2:s[6] || "x",line2:parseInt(s[7]||"1")};	
}

var volpb2vl=function(str){
	var out=[];
	var volpage=parseVolPage(str);
	if(! volpage){console.log(str); return 0;}
	if(volpage["side"]=="a"){var side=1;}
	else if(volpage["side"]=="b"){side=2;}
	else if(volpage["side"]=="c"){side=3;}
	else if(volpage["side"]=="d"){side=4;}
	else {side=0;}
	
	var vline=volpage["vol"]*500*4*10+volpage["page"]*4*10+side*10+volpage["line"];
	
	return vline;
}

var vl2volpb=function(vline){
	var vol=Math.floor(vline/(500*4*10));
	var page_p=vline%(500*4*10);
	var page=Math.floor(page_p/(4*10));
	var side_p=page_p%(4*10);
	var side=Math.floor(side_p/10);
	var line=side_p%10;
	if(side==0){side="a";}
	else if(side==1){side="b";}
	else if(side==2){side="c";}
	else if(side==3){side="d";}
	var volpb=vol+"."+page+side+line;

	return volpb;
}

var searchNameCh=function(KJing,from,to){
	//判斷輸入是J版本還是D版本再依其版本取得K
	//在pedurma_taisho從K值轉換成中文經號
	var result=[];
	for(var i=0;i<pedurma_taisho.length;i++){
		if(KJing==pedurma_taisho[i][0]){
			var taisho=pedurma_taisho[i][1].split(",");  ////對照到中有多個經時

			for(var j=0;j<taisho.length;j++){
				//回去taishonames找到該項，得到中文經名
				var taishoNumName=taisho2taishoName(taisho[j]);//[T01n0001,經名]
				//將中文經名加上超連結
				result.push(addLink(taishoNumName[0],taishoNumName[1]));
			}
			document.getElementById("nameCh").innerHTML=result.join("、");
			break;
		}
	}
}



var taisho2taishoName=function(taisho){ //把pedurma_taisho裡的taisho號碼轉換為經名
	for(var i=0;i<taishonames.length;i++){
		var taishoNum=parseInt(taishonames[i][0].substr(4,4));//taishonames[i][0].length-4
		if(parseInt(taisho) == taishoNum){
			return taishonames[i];//[T01n0001,經名]
		}
	}
}

var addLink=function(link,name){
	if(link.match(/T0.n0220/)){
		link=link.substr(0,link.length-1);
	}
	return '<a target=_new href="http://tripitaka.cbeta.org/'+link+'">'+name+"</a>";
}

var showImage=function(corresline,to){//corresline:對照行(分開成物件的對照行)
	//去掉行數 把vol page side 湊成檔名
	var filename=id2imageFileName(corresline);//[函號(用來進入該函資料夾),檔名]
	//var Line="volpage:"+corresline.vol+", page:"+corresline.page+", side:"+corresline.side+", line:"+corresline.line;
	//return '<a target=_new href="http://dharma-treasure.org/kangyur_images/'+longnames[to.rcode].toLowerCase()+'/'+filename[0]+'/'+filename[1]+'">'+Line+"</a>";
	return '<img src="http://dharma-treasure.org/kangyur_images/'+longnames[to.rcode].toLowerCase()+'/'+filename[0]+'/'+filename[1]+'"></a>';
}

var id2imageFileName=function(id){
	//var id=parseVolPage(corresline);
	var realpage=snap2realpage(id);
	var p="00"+realpage.vol;
	var nameVol=p.substr(p.length-3);
	var q="00"+realpage.page;
	var namePageSide=q.substr(q.length-3)+realpage.side;
	var filename=[nameVol,nameVol+"-"+namePageSide+".jpg"];

	return filename;
}

var snap2realpage=function(id){
	if(id.side == "c"){
		id.side=id.side.replace("c","b");
	}
	else if(id.side == "d"){
		id.page=id.page+1;
		id.side="a";
	}

	return id;
}




var corres_api={dosearch:dosearch}
module.exports=corres_api;