/** @jsx React.DOM */

/* to rename the component,
 change name of ./component.js and  "dependencies" section of ../../component.js */
var React=require("react");
var require_kdb=[{
  filename:"jiangkangyur.kdb"  , 
  url:"http://ya.ksana.tw/kdb/jiangkangyur.kdb" , desc:"jiangkangyur"
}];
var Tabarea=require("./tabarea.jsx");
var Fileinstaller=require("ksana2015-webruntime").fileinstaller;
var kde=require("ksana-database");  // Ksana Database Engine
var kse=require("ksana-search"); // Ksana Search Engine (run at client side)
var tibetan=require("ksana-tibetan").wylie;
var Showtext=require("./showtext.jsx");

var version="v0.1.45";
var main = React.createClass({
  getInitialState: function() {
    //for Mac OS X, edit info.plist
    //  <key>CFBundleName</key>
    document.title="Adarsha "+version;
    return {sidemenu:true,dialog:null,res:{},res_toc:[],bodytext:{file:0,page:0},db:null,toc_result:[],page:0,field:"sutra",scrollto:0,hide:false, wylie:false, dataN:null};
  },
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
  setBannerHeight:function(bannerHeight) {
    var ch=document.documentElement.clientHeight;
    //this.refs["text-content"].getDOMNode().style.height=ch-bannerHeight+"px";
    //this.refs["tab-content-main"].getDOMNode().style.height=(ch-bannerHeight-40)+"px";
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
  gotofile:function(vpos){
    //var res=kse.vpos2filepage(this.state.db,vpos);
    var res=this.state.db.fileSegFromVpos(vpos);
    this.showPage(res.file,res.seg);
  },
  showPage:function(f,p) {  
    window.location.hash = this.encodeHashTag(f,p);
    var that=this;
    var pagename=this.state.db.getFileSegNames(f)[p];
    this.setState({scrollto:pagename});

    kse.highlightFile(this.state.db,f,{q:this.state.tofind,token:true},function(data){//kde
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
          <Tabarea toc={this.state.toc} showText={this.showText} menuclass={menuclass} db={this.state.db} wylie={this.state.wylie} gotofile={this.gotofile} toc={this.state.toc} />
        </div>
        <div className={bodytextcols}>    
          <div className="text text-content" ref="text-content">
            <Showtext className="showtext" sidemenu={this.state.sidemenu} toggleMenu={this.toggleMenu} dataN={this.state.dataN} setwylie={this.setwylie} wylie={this.state.wylie} page={this.state.page}  bodytext={this.state.bodytext} text={text} nextfile={this.nextfile} prevfile={this.prevfile} setpage={this.setPage} db={this.state.db} toc={this.state.toc} scrollto={this.state.scrollto} />
          </div>
        </div>
      </div>
    </div>

      );
    }
  }
});

module.exports=main;