/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var React=require('react');
var Defbox=require("./defbox.jsx");
var corres_api=require("./corres_api");
var dict_api=require("./dict_api");
var jPedurma=require("./jPedurma");
var dPedurma=require("./dPedurma");
var hPedurma=require("./hPedurma");
var mappings={"J":jPedurma,"D":dPedurma,"H":hPedurma};

var showseg= React.createClass({
  getInitialState: function() {
    return {recen:"lijiang",showCorres:false,clickedChPos:{left:0,top:0},openBox:"",vpos:0};
  },
  componentWillReceiveProps: function(nextProps) {
    if(this.props.clickedCorrespb != nextProps.clickedCorrespb){
      this.setState({showCorres:true,clickedCorrespb:nextProps.clickedCorrespb});
    } else this.setState({showCorres:false});
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
      if(i != "J") corresPages[i] = corres_api.dosearch(pbJ,mappings["J"],mappings[i]);
    }

    return corresPages;
  },
  togglePageImg: function(e) {
    if(e.target.nodeName == "SPAN" && e.target.getAttribute("vpos")) {
      var vpos=e.target.getAttribute("vpos");
      var def=dict_api.exhaustiveFind(e.target.textContent);//"ཀུ་བ་"
      var clickedChPos = $('span[vpos="'+vpos+'"]').position();
      this.setState({openBox:true,clickedChPos:clickedChPos,def:def,vpos:vpos});
    } else this.setState({openBox:false});
    if(e.target.dataset.type=="goCorres") {
      this.props.addCorresImage(e.target.dataset.pb,e.target.dataset.recen);
      //this.renderCorresImg(e.target.previousSibling.previousSibling.dataset.pb, e.target.dataset.pb,e.target.dataset.recen);
      return;
    }
    if (e&& e.target && e.target.nextSibling && e.target.nextSibling.nextSibling &&
      e.target.nextSibling.nextSibling.nodeName=="IMG") {
      if (e.target && e.target.dataset) {
        var pb=e.target.dataset.pb;
        if (pb) this.props.removeImage(pb);
      }
    } else {
      var pb=null;
      if (e.target && e.target.dataset) {
        if(e.target.nodeName=="SPAN") pb=e.target.parentElement.dataset.pb;//add parentElement
        else pb=e.target.dataset.pb
      }
      if (pb) {
        this.props.addImage(pb,"J");
      } else {
        if (e && e.target && e.target.previousSibling && e.target.previousSibling
          && e.target.previousSibling.previousSibling && e.target.previousSibling.previousSibling.previousSibling.dataset){
          var pb=e.target.previousSibling.previousSibling.previousSibling.dataset.pb;
          if (pb) this.props.removeImage(pb);
        }
      }  
    }    
  },
  renderPb: function(seg){
    var clickedpb=this.props.clickedpb;
    if(clickedpb.indexOf(seg.pb)>-1){
      var imgName, imgLink;
      var corresPage=this.getAllCorresPages(seg.pb);//clickedpb[clickedpb.indexOf(seg.pb)].pb
      if(!this.state.showCorres) {
        imgName=this.getImgName(seg.pb);
        imgLink="http://res.cloudinary.com/www-dharma-treasure-org/image/upload/"+this.props.recen+"/"+imgName+".jpg";//
      } else {
        imgName=this.getImgName(this.state.clickedCorrespb);
        imgLink="http://res.cloudinary.com/www-dharma-treasure-org/image/upload/"+this.props.recen+"/"+imgName+".jpg";//
      }
      return (
        <div>
          <a href="#" data-pb={seg.pb}>{seg.pb}</a>
          &nbsp;&nbsp;
          Derge:<a data-type="goCorres" data-recen="D" data-pb={corresPage.D}>{corresPage.D}</a>
          &nbsp;&nbsp;
          Lhasa:<a data-type="goCorres" data-recen="H" data-pb={corresPage.H}>{corresPage.H}</a>
          <img className="sourceimage" data-img={seg.pb} width="100%" src={imgLink} /><br></br>
        </div>
      );
      nextpagekeepcrlf=true;
    } else {
      return (
        <div>
          <a href="#" data-pb={seg.pb}>{seg.pb}<img width="25" data-pb={seg.pb} src="banner/imageicon.png" /></a>
        </div>
      );
    }
  },

  render: function() {
    var seg=this.props.segs ||{};
    if(typeof seg != "undefined") var linkedPb = this.renderPb(seg);//{this.props.segs.pb}

    return (
     <div>
        <div onKeypress={this.keyup} onClick={this.togglePageImg} ref="pagetext" className="pagetext">
          {linkedPb}
          <div dangerouslySetInnerHTML={{__html: this.props.segs.text}} />
        </div>
        <Defbox vpos={this.state.vpos} clickedChPos={this.state.clickedChPos} def={this.state.def} openBox={this.state.openBox} />
      </div>
    );
  }
});
module.exports=showseg;