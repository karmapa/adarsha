/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var React=require("react");
var Textcontrolbar=require("./textcontrolbar.jsx");
var Showseg=require("./showseg.jsx");
var tibetan=require("tibetan/wylie");

var showtext = React.createClass({
  getInitialState: function() {
    return {message:"",pageImg:"",clickedpb:[],clickedCorrespb:[],recen:"lijiang",clickedChPos:{left:0,top:0},openBox:"",vpos:0};
  },
  shouldComponentUpdate:function(nextProps,nextState) {
    if (nextProps.page!=this.props.page && typeof nextProps.page != "number") { //typeof NaN = "number"
      nextState.clickedpb=[]; //reset image
      nextState.clickedCorrespb=[]; //reset corres image
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
  addImage:function(pb) {
    var clickedpb=this.state.clickedpb;
    var idx=clickedpb.indexOf(pb);//idx=clickedpb.indexOf(clickedpb)
    if (idx==-1) clickedpb.push(pb);
    this.setState({clickedpb:clickedpb,recen:"lijiang"});
  },
  getSegsFromFile: function(file) {
    var segs=[], pb=[], text=[];
    var that=this;
    var out="",lastidx=0,nextpagekeepcrlf=false;

    file.replace(/<pb n="(.*?)"><\/pb>/g,function(m,m1,idx){
      var pagetext=file.substring(lastidx+m.length,idx);
      pb.push(m1);
      text.push(pagetext);
      lastidx=idx;
    });
    var t1=file.substr(file.lastIndexOf("<pb"));
    var t=t1.replace(/<pb n="(.*?)"><\/pb>/,"");
    text.push(t);
    pb.map(function(item,i){
      segs.push({pb:item,text:text[i+1]});
    });
    //console.log("pb:",pb.length,"text:",text.length);
    return segs;
  },
  scroll:function() {
    console.log("scrolled!");
  },
  render: function() {
    var content=this.props.text||"";
    if (this.props.wylie) content=tibetan.toWylie(content,null,false);
    //content=this.renderpb(content);
    var that=this;
    var s=this.getSegsFromFile(content);
    var segs=[];
    s.map(function(item){
      segs.push(<Showseg segs={item} clickedpb={that.state.clickedpb} recen={that.state.recen} addImage={that.addImage} addCorresImage={that.addCorresImage} removeImage={that.removeImage} />);
    });

    return (
      <div className="cursor" onScroll={this.scroll}>
        <Textcontrolbar message={this.state.message} sidemenu={this.props.sidemenu} toggleMenu={this.props.toggleMenu} dataN={this.props.dataN} setwylie={this.props.setwylie} wylie={this.props.wylie} page={this.props.page} bodytext={this.props.bodytext}  next={this.props.nextfile} prev={this.props.prevfile} setpage={this.props.setpage} db={this.props.db} toc={this.props.toc} />
        <br></br><br></br>
        <div ref="pagetext">{segs}</div>
      </div>
    );
  }
});
module.exports=showtext;