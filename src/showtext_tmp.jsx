/** @jsx React.DOM */

//showtext tmp





var React=require("react");
var corres_api=require("./corres_api");
var dict_api=require("./dict_api");
var Textcontrolbar=require("./textcontrolbar.jsx");
var Defbox=require("./defbox.jsx");
var tibetan=require("ksana-tibetan").wylie;
var jPedurma=require("./jPedurma");
var dPedurma=require("./dPedurma");
var hPedurma=require("./hPedurma");
var mappings={"J":jPedurma,"D":dPedurma,"H":hPedurma};

var showtext = React.createClass({
  getInitialState: function() {
    return {message:"",pageImg:"",clickedpb:{},recen:"lijiang",clickedChPos:{left:0,top:0},openBox:"",vpos:0};
  },
  shouldComponentUpdate:function(nextProps,nextState) {
    if (nextProps.page!=this.props.page) {
      nextState.clickedpb=[]; //reset image
    }
    return true;
  },
  componentWillReceiveProps: function() {
    this.shouldscroll=true;
  },
  excerptCopy:function() {
      var gui = nodeRequire('nw.gui');
      // We can not create a clipboard, we have to receive the system clipboard
      var clipboard = gui.Clipboard.get();

      var selection = window.getSelection();
      var range = selection.getRangeAt(0); 
      if (range) { 
        var container = document.createElement("div");
        container.appendChild(range.cloneContents());
        var source=$("#address").html().replace(/<.*?>/g,"/");
        var text=container.innerHTML + "("+source+")";
        text=text.replace(/<.*?>/g,"");
        clipboard.set(text);
        this.setState({message:"Text copied to clipboard with source infomation"});
      }
  },
  handleKeyUp:function(e) {
    if (e.keyCode==67 && e.ctrlKey){
      if (typeof process!="undefined" && process.versions&&process.versions["node-webkit"]) {
        e.preventDefault();
        this.excerptCopy();
      }
    }
  },

  componentDidMount:function() {
    this.textcontent=$(".text-content");
    window.addEventListener("keyup", this.handleKeyUp);
  },
  componentWillUnmount:function() {
    window.removeEventListener("keyup", this.handleKeyUp);
  },
  onImageError:function() {
    console.log("image error");
  },
  checkImageLoaded:function() {
    var pagetext=this.refs.pagetext.getDOMNode();
    var images=pagetext.querySelectorAll("IMG.sourceimage");
    for (var i=0;i<images.length;i++) {
      var img=images[i];
      if (img.naturalWidth==0) {
        img.src="banner/image_notfound.png";
      }
    }
  },
  componentDidUpdate: function()  {
    if(this.shouldscroll && this.props.scrollto && this.props.scrollto.match(/[abc]/) ){
      var p=this.props.scrollto.match(/\d+.(\d+)[abc]/);
      this.textcontent.scrollTop( 0 );
      if(p[1]!=1){
        $("a[data-pb]").removeClass("scrolled");      
        var pb=$("a[data-pb='"+this.props.scrollto+"']");
        if(pb.length) {
          this.textcontent.scrollTop( pb.position().top-120 );
          pb.addClass("scrolled");
        }
      }
    } else if(this.shouldscroll){
      $(".text-content").scrollTop( 0 );
    }
    var that=this;
    clearTimeout(this.checkimagetimer);
    this.checkimagetimer=setTimeout(function(){
      that.checkImageLoaded();
    },2000);
    this.shouldscroll=false;
  },
  hitClick: function(n){
    if(this.props.showExcerpt) this.props.showExcerpt(n);
  },
  removeImage:function(pb) {
    var clickedpb=this.state.clickedpb;
    var idx=clickedpb.indexOf(pb);
    if (idx>-1) clickedpb.splice(idx,1);
    this.setState({clickedpb:clickedpb});
  },
  addImage:function(pb,recen) {
    var r;
    var clickedpb=this.state.clickedpb;
    var idx=clickedpb.indexOf(clickedpb);
    if (idx==-1) clickedpb.push(pb);
    if(recen=="J") r="lijiang";
    if(recen=="D") r="derge";
    if(recen=="H") r="lhasa";
    this.setState({clickedpb:clickedpb,recen:r});
  },

  togglePageImg: function(e) {
    if(e.target.nodeName == "SPAN" && e.target.getAttribute("vpos")) {
      var vpos=e.target.getAttribute("vpos");
      var def=dict_api.exhaustiveFind(e.target.textContent);//"ཀུ་བ་"
      var clickedChPos = $('span[vpos="'+vpos+'"]').position();
      this.setState({openBox:true,clickedChPos:clickedChPos,def:def,vpos:vpos});
    } else this.setState({openBox:false});
    if(e.target.dataset.type=="goCorres") {
      this.addImage(e.target.dataset.pb,e.target.dataset.recen);
      //this.renderCorresImg(e.target.previousSibling.previousSibling.dataset.pb, e.target.dataset.pb,e.target.dataset.recen);
      return;
    }
    if (e&& e.target && e.target.nextSibling && e.target.nextSibling.nextSibling &&
      e.target.nextSibling.nextSibling.nodeName=="IMG") {
      if (e.target && e.target.dataset) {
        var pb=e.target.dataset.pb;
        if (pb) this.removeImage(pb);
      }
    } else {
      var pb=null;
      if (e.target && e.target.dataset) pb=e.target.dataset.pb;
      if (pb) {
        this.addImage(pb,"J");
      } else {
        if (e && e.target && e.target.previousSibling && e.target.previousSibling
          && e.target.previousSibling.previousSibling && e.target.previousSibling.previousSibling.previousSibling.dataset){
          var pb=e.target.previousSibling.previousSibling.previousSibling.dataset.pb;
          if (pb) this.removeImage(pb);
        }
      }  
    }    
  },

  getImgName: function(volpage) {
    var p=volpage.split(".");
    var v="000"+p[0];
    var vol=v.substr(v.length-3,v.length);
    var pa="000"+p[1].substr(0,p[1].length-1);
    var page=pa.substr(pa.length-3,pa.length);
    var side=p[1].substr(p[1].length-1);

    return vol+"/"+vol+"-"+page+side;
  },
  getAllCorresPages: function(pbJ) {
    var corresPages={};
    for(var i in mappings) {
      if(i != "J") {
        //corresPages[i] = this.getCorresEachPage(pbJ,"J",i);
        corresPages[i] = corres_api.dosearch(pbJ,mappings["J"],mappings[i]);
      }
    }
    console.log(corresPages);
    return corresPages;
  },
  renderpb: function(s){
    var that=this;
    if(typeof s == "undefined") return "";
    var out="",lastidx=0,nextpagekeepcrlf=false;

    s.replace(/<pb n="(.*?)"><\/pb>/g,function(m,m1,idx){
      var p=m1.match(/\d+.(\d+[ab])/) || ["",""];
      var link="";
      var pagetext=s.substring(lastidx+m.length,idx);
      if (idx==0) pagetext="";
      if(that.state.clickedpb.indexOf(m1)>-1){
        var imgName=that.getImgName(m1);
        //var corresPage=that.getCorresPage(m1);
        var corresPage=that.getAllCorresPages(m1);
        link='</span><br></br><a href="#" data-pb="'+m1+'">'+m1+
        '</a>&nbsp;&nbsp;Derge:<a data-type="goCorres" data-recen="D" data-pb='+corresPage.D+'>'+corresPage.D+'</a>&nbsp;&nbsp;Lhasa:<a data-type="goCorres" data-recen="H" data-pb='+corresPage.H+'>'+corresPage.H+'</a><img class="sourceimage" data-img="'+m1+'" width="100%" src="http://res.cloudinary.com/www-dharma-treasure-org/image/upload/'+that.state.recen+'/'+imgName+'.jpg"/><br></br>'
        +'<span class="textwithimage">';
        nextpagekeepcrlf=true;
      } else {
        link='</span><br></br><a href="#" data-pb="'+m1+'">'+m1+'<img width="25" data-pb="'+m1+'" src="banner/imageicon.png"/></a><span>';
      }
      if (!nextpagekeepcrlf) {
        pagetext=pagetext.replace(/། །\r?\n/g,"། །");
        pagetext=pagetext.replace(/།།\r?\n/g,"།།");
        pagetext=pagetext.replace(/།\r?\n/g,"། ");
        pagetext=pagetext.replace(/\r?\n/g,"");
        nextpagekeepcrlf=false;
      }
      out+=pagetext+link;
      lastidx=idx;
    });
    out+=s.substring(lastidx);

    out="<span>"+out+"</span>";
    
    return out;
  },

  render: function() {
    var content=this.props.text||"";
    //if (this.props.wylie) content=tibetan.romanize.toWylie(content,null,false);
    content=this.renderpb(content);
 
    return (
      <div className="cursor" >
        <Textcontrolbar message={this.state.message} sidemenu={this.props.sidemenu} toggleMenu={this.props.toggleMenu} dataN={this.props.dataN} setwylie={this.props.setwylie} wylie={this.props.wylie} page={this.props.page} bodytext={this.props.bodytext}  next={this.props.nextfile} prev={this.props.prevfile} setpage={this.props.setpage} db={this.props.db} toc={this.props.toc} />
        <div onKeypress={this.keyup} onClick={this.togglePageImg} ref="pagetext" className="pagetext" dangerouslySetInnerHTML={{__html: content}} />
        <Defbox vpos={this.state.vpos} clickedChPos={this.state.clickedChPos} def={this.state.def} openBox={this.state.openBox} />
      </div>
    );
  }
});
module.exports=showtext;