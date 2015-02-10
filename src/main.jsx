/** @jsx React.DOM */

/* to rename the component,
 change name of ./component.js and  "dependencies" section of ../../component.js */
var React=require("react");
var require_kdb=[{
  filename:"jiangkangyur.kdb"  , 
  url:"http://ya.ksana.tw/kdb/jiangkangyur.kdb" , desc:"jiangkangyur"
}];
//var othercomponent=Require("other"); 
var Resultlist=require("./resultlist.jsx");
var Fileinstaller=require("ksana2015-webruntime").fileinstaller;
var kde=require("ksana-database");  // Ksana Database Engine
var kse=require("ksana-search"); // Ksana Search Engine (run at client side)
var tibetan=require("ksana-tibetan").wylie;
var Stacktoc=require("ksana2015-stacktoc").component;  //載入目錄顯示元件
var search_api=require("./search_api");
var Showtext=require("./showtext.jsx");
var Namelist=require("./namelist.jsx");
var version="v0.1.45";
var main = React.createClass({
  hideBanner:function() {
    var header=$("div.header");
    var that=this;
    header.animate({height: "0px"}, 2000, function() {
      header.hide();
      that.bannerHeight=0;
      that.setBannerHeight(0);
    });
  },
  toggleMenu:function(){
    this.setState({sidemenu:!this.state.sidemenu});
  },
  bannerHeight:100,
  handleResize:function() {
    clearTimeout(this.resizetimer);
    var that=this;
    this.resizetimer=setTimeout(function(){
      that.setBannerHeight(that.bannerHeight);
    },300);
  },
  componentWillUnmount:function() {
    window.removeEventListener('resize', this.handleResize);
  },
  componentDidMount:function() {
    var that=this;
    setTimeout(function(){
      that.hideBanner();
    },5000);
    //window.onhashchange = function () {that.goHashTag();} 
    window.addEventListener('resize', this.handleResize);
  }, 
  getInitialState: function() {
    //for Mac OS X, edit info.plist
    //  <key>CFBundleName</key>
    document.title="Adarsha "+version;
    return {sidemenu:true,dialog:null,res:{},res_toc:[],bodytext:{file:0,page:0},db:null,toc_result:[],page:0,field:"sutra",scrollto:0,hide:false, wylie:false, dataN:null};
  },
  setBannerHeight:function(bannerHeight) {
    var ch=document.documentElement.clientHeight;
    this.refs["text-content"].getDOMNode().style.height=ch-bannerHeight+"px";
    this.refs["tab-content"].getDOMNode().style.height=(ch-bannerHeight-40)+"px";
  },
  componentDidUpdate:function()  {
    this.setBannerHeight(this.bannerHeight);
  },  
  encodeHashTag:function(file,p) { //file/page to hash tag
    var f=parseInt(file)+1;
    return "#"+f+"."+p;
  },
  decodeHashTag:function(s) {
    var fp=s.match(/#(\d+)\.(.*)/);
    var p=parseInt(fp[2]);

    var file=parseInt(fp[1])-1;
    if (file<0) file=0;
    if (p<0) p=0;
    var pagename=this.state.db.getFileSegNames(file)[p]; 
    this.setPage(pagename,file);
  },
  goHashTag:function() {
    this.decodeHashTag(window.location.hash || "#1.1");
  
  },  
  searchtypechange:function(e) {
    this.refs.tofind.getDOMNode().focus();
    this.dosearch(null,null,0);
  },
  clicksearch:function(e) {
    if (!e || !e.target) return null;
    this.refs.tofind.getDOMNode().value=e.target.innerHTML;
    this.searchtypechange();
  },
  tofindchange:function(e) {
    clearTimeout(this.tofindtimer);
    var that=this;
    this.tofindtimer=setTimeout(function(){
      that.dosearch(null,null,0);
    },300);
    //var field=e.target.parentElement.dataset.type;
  },
  removeLeadingEndingSpace:function(tofind) {
    if (!tofind || tofind.length<2) return tofind;
    return tofind.replace(/^་/,"").replace(/་$/,"");
  },
  dosearch: function(e,reactid,start_end){
    var start=start_end,tochit=0;
    var end=this.state.db.get("meta").vsize;
    if (typeof start_end!="number" && typeof start_end[0]=="number") {
      start=start_end[0];
      end=start_end[1];
      tochit=start_end[2];
    }
    var field=$(this.refs.searchtype.getDOMNode()).find(".active")[0].dataset.type;
    var tofind=this.refs.tofind.getDOMNode().value.trim();
    tofind=tofind.replace(/\\/g,"\\\\"); //escape operator
    tofind=tofind.replace(/\*/g,"**"); //escape operator

    tofind=tibetan.romanize.fromWylie(tofind);
    tofind=tofind.replace(/༌༌/g,"*");
    tofind=this.removeLeadingEndingSpace(tofind);

    field=field || this.state.field;
    if(field == "fulltext"){
      kse.search(this.state.db,tofind,{phrase_sep:"།",
        range:{start:start,end:end,maxhit:100}},function(data){ //call search engine          
        data.tochit=tochit;
        this.setState({res:data, tofind:tofind, res_toc:[] });  
      });
    }
    if(field == "kacha"){
      var res_kacha=search_api.searchKacha(tofind,this.state.toc);
      if(tofind != "") this.setState({res_toc:res_kacha||[], tofind:tofind, res:[]});
      else this.setState({res_toc:[], tofind:tofind, res:[]});
    }
    if(field == "sutra"){
      var res_sutra=search_api.searchSutra(tofind,this.state.toc);
      if(tofind != "") this.setState({res_toc:res_sutra||[], tofind:tofind, res:[]});
      else this.setState({res_toc:[], tofind:tofind, res:[]});
    }  
  },
  renderInputSyntax:function() {
    if (!this.refs.searchtype) return;
    var field=$(this.refs.searchtype.getDOMNode()).find(".active")[0].dataset.type;
    if (this.refs && this.refs.tofind && this.refs.tofind.getDOMNode().value.length==0){
      if (field=="fulltext") {
        return (
        <div className="syntaxhelper">
          <div><b>Wildcards:</b> ? * <br/>
            ? match single unknown syllable:<br/>
              e.g: <a href="#" onClick={this.clicksearch}>bde ? snying</a> 1 syllable in between<br/>
              e.g: <a href="#" onClick={this.clicksearch}>མི་2?་པ</a> 2 syllables in between<br/>
            * match a range of unknown syllables:<br/>
              e.g: <a href="#" onClick={this.clicksearch}>mi 5* pa</a> 1 to 5 syllables in between<br/>

          </div>
          <div><b>Word separator:</b>
           / or ། (shad) <br/>
              e.g: <a href="#" onClick={this.clicksearch}>bde/snying</a><br/>
          </div>      
        </div>
          ) 
      } else if (field=="sutra") {
        return (
          <div className="syntaxhelper">
            Type <a href="#" onClick={this.clicksearch} style={{fontSize:"300%"}}>་</a>(tsheg) to display all titles.
          </div>
        )
      } else {
        return (
          <div className="syntaxhelper">
            Type <a href="#" onClick={this.clicksearch} style={{fontSize:"300%"}}>་</a>(tsheg) to display table of content.
          </div>
        )
      }

    } else return null;
    
  },
  renderinputs:function(searcharea) {  // input interface for search // onInput={this.searchtypechange}
    if (this.state.db) {
      return (    
        <div className="button-group ">
            <input ref="tofind" className="tofind searchinput input-lg form-control" type="search" id="tofind" onInput={this.tofindchange} 
            placeholder="Type Tibetan or Wylie transliteration"/>
        </div>
        )          
    } else {
      return <span>loading database....</span>
    }
  },   
  genToc:function(texts,depths,voffs){
    var out=[{depth:0,text:"འཇང་བཀའ་འགྱུར།"}];
    for(var i=0; i<texts.length; i++){
      out.push({text:texts[i],depth:depths[i],voff:voffs[i]});
    }
    return out; 
  },// 轉換為stacktoc 目錄格式
  onReady:function(usage,quota) {
    if (!this.state.db) kde.open("jiangkangyur",function(a,db){
        this.setState({db:db});
        db.get([["fields","head"],["fields","head_depth"],["fields","head_voff"]],function(){
          var heads=db.get(["fields","head"]);
          var depths=db.get(["fields","head_depth"]);
          var voffs=db.get(["fields","head_voff"]);
          var toc=this.genToc(heads,depths,voffs);
          this.setState({toc:toc});
          this.goHashTag();
        }); //載入目錄
    },this);    
      
    this.setState({dialog:false,quota:quota,usage:usage});
    
  },
  openFileinstaller:function(autoclose) {
    if (window.location.origin.indexOf("http://127.0.0.1")==0) {
      require_kdb[0].url=window.location.origin+window.location.pathname+"jiangkangyur.kdb";
    }
    return <Fileinstaller quota="512M" autoclose={autoclose} needed={require_kdb} 
                     onReady={this.onReady}/>
  },
  showExcerpt:function(n) {
    var voff=this.state.toc[n].voff;
    var end=this.state.toc[n].end;
    var hit=this.state.toc[n].hit;
   // var searchtabid=$(".tab-pane#Search").attr("id");
    $('.nav a[href=#Search]').tab('show');
    $("label.searchmode").removeClass("active");
    $("label[data-type='fulltext']").addClass("active");
    this.dosearch(null,null,[voff,end,hit]);
  },
  gotofile:function(vpos){
    var res=kse.vpos2filepage(this.state.db,vpos);
    this.showPage(res.file,res.page);
  },
  showPage:function(f,p) {  
    window.location.hash = this.encodeHashTag(f,p);
    var that=this;
    var pagename=this.state.db.getFileSegNames(f)[p];
    this.setState({scrollto:pagename});

    kse.highlightFile(this.state.db,f,{q:this.state.tofind,nospan:true},function(data){//kde
      console.log(data);
      that.setState({bodytext:data,page:p});
    });
  }, 
  showText:function(n) {
    var res=this.state.db.fileSegFromVpos(this.state.toc[n].voff);
    if(res.file != -1) this.showPage(res.file,res.seg);
    this.setState({dataN:n});    
  },
  nextfile:function() {
    var file=this.state.bodytext.file+1;
    var page=this.state.bodytext.page || 1;
    this.showPage(file,page);
    this.setState({scrollto:null});
  },
  prevfile:function() {
    var file=this.state.bodytext.file-1;
    var page=this.state.bodytext.page || 1;
    if (file<0) file=0;
    this.showPage(file,page);
    this.setState({scrollto:null});
  },
  setPage:function(newpagename,file) {
    var fp=this.state.db.findSeg(newpagename);
    if (fp.length){
      this.showPage(fp[0].file,fp[0].page);
    }
    //console.log(newpagename);
  },
  setwylie: function() {
    this.setState({wylie:!this.state.wylie});
    this.setState({scrollto:null});
  },
  textConverter:function(t) {
    if(this.state.wylie == true) return tibetan.romanize.toWylie(t,null,false); 
    return t; 
  },
  startsearch:function() {
    var that=this;
    setTimeout(function(){
      that.refs.tofind.getDOMNode().focus();  
    },500);
    
  },
  render: function() {
    if (!this.state.quota) { // install required db
        return this.openFileinstaller(true);
    } else { 
      var text="",pagename="";
      if (this.state.bodytext) {
        text=this.state.bodytext.text;
        pagename=this.state.bodytext.pagename;
    }
    var bodytextcols="col-md-8";
    var menuclass="col-md-4";
    if (!this.state.sidemenu) {
      bodytextcols="";
      menuclass="hidemenu";
    }

    return (

  <div className="row">
      <div className="header">
        <img width="100%" src="./banner/banner.png"/>
      </div>

      <div className="row">
        <div className={menuclass}>
          <div className="borderright">
            <ul className="nav nav-tabs" role="tablist">
              <li className="active"><a href="#Catalog" role="tab" data-toggle="tab" title="Catalog"><img width="25" src="./banner/icon-read.png"/></a></li>
              <li><a href="#Search" role="tab" onClick={this.startsearch} data-toggle="tab" title="Search"><img width="25" src="./banner/search.png"/></a></li>              
            </ul>

            <div className="tab-content" ref="tab-content">
              <div className="tab-pane fade in active" id="Catalog">               
                <Stacktoc textConverter={this.textConverter} showText={this.showText} showExcerpt={this.showExcerpt} 
                opts={{tocbar:"banner/bar.png",tocbar_start:"banner/bar_start.png",stopAt:"་",
                maxitemlength:42,tocstyle:"vertical_line"}}
                hits={this.state.res.rawresult} data={this.state.toc} goVoff={this.state.goVoff} />
              </div>

              <div className="tab-pane fade" id="Search">
                <div className="slight"><br/></div>
                {this.renderinputs("title")}
                <div className="center">
                  <div className="btn-group" data-toggle="buttons" ref="searchtype" onClick={this.searchtypechange}>
                    <label data-type="sutra" className="btn btn-default btn-xs searchmode">
                    <input type="radio" name="field" autocomplete="off"><img title="མདོ་མིང་འཚོལ་བ། Title Search" width="25" src="./banner/icon-sutra.png"/></input>
                    </label>
                    <label data-type="kacha" className="btn btn-default btn-xs searchmode">
                    <input type="radio" name="field" autocomplete="off"><img title="དཀར་ཆག་འཚོལ་བ། Table of Content Search" width="25" src="./banner/icon-kacha.png"/></input>
                    </label>
                    <label data-type="fulltext" className="btn btn-default btn-xs searchmode active">
                    <input type="radio" name="field" autocomplete="off"><img title="ནང་དོན་འཚོལ་བ།  Full Text Search" width="25" src="./banner/icon-fulltext.png"/></input>
                    </label>
                  </div> 
                
                </div>       
                {this.renderInputSyntax()}
                <Namelist wylie={this.state.wylie} res_toc={this.state.res_toc} tofind={this.state.tofind} gotofile={this.gotofile} />
                <Resultlist wylie={this.state.wylie} res={this.state.res} tofind={this.state.tofind} gotofile={this.gotofile} />
              </div>        
            </div>      
          </div>     
        </div>

        <div className={bodytextcols}>
          
          <div className="text text-content" ref="text-content">
          <Showtext sidemenu={this.state.sidemenu} toggleMenu={this.toggleMenu} dataN={this.state.dataN} setwylie={this.setwylie} wylie={this.state.wylie} page={this.state.page}  bodytext={this.state.bodytext} text={text} nextfile={this.nextfile} prevfile={this.prevfile} setpage={this.setPage} db={this.state.db} toc={this.state.toc} scrollto={this.state.scrollto} />
          </div>
        </div>
      </div>
    </div>

      );
    }
  }
});

module.exports=main;