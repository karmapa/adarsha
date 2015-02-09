var tibetan=require("ksana-tibetan").wylie;
var Textcontrolbar = React.createClass({
  getInitialState: function() {
    return {address:0,fontsize:125,message:""};
  },
  filepage2vpos:function(file,page) {
    var out=[];
    if(!this.props.db || !this.props.toc) return 0;
    var offsets=this.props.db.getFilePageOffsets(file);
    var voff=offsets[page];

    var n=this.findByVoff(voff);//toc裡的第幾項
    var parents=this.enumAncestors(n) || [];

    for(var i=0; i<parents.length; i++){
      out.push(this.props.toc[parents[i]].text);
    }
    return out.join('<img src="banner/slash.png"></img>');
  },

  findByVoff: function(voff) {
    if(!this.props.toc) return 0;
    for (var i=0;i<this.props.toc.length;i++) {
      var t=this.props.toc[i];
      if (t.voff>voff) return i-1;
    }
    return 0; //return root node
  },
  enumAncestors: function(cur) {
    var toc=this.props.toc;
    if (!toc || !toc.length) return;
    //var cur=this.state.cur;
    if (cur==0) return [];
    var n=cur;
    var depth=toc[cur].depth - 1;
    var parents=[];
    while (n>=0 && depth>0) {
      if (toc[n].depth==depth) {
        parents.unshift(n);
        depth--;
      }
      n--;
    }
    parents.unshift(0); //first ancestor is root node
    parents.push(cur);

    return parents;
  },
  getAddress: function() {
    if (!this.props.bodytext)return;
    var file=this.props.bodytext.file;
    var page=this.props.page;
    var res=this.filepage2vpos(file,page);
   if(this.props.wylie == false) return res;
   if(this.props.wylie == true) return tibetan.romanize.toWylie(res,null,false);    
  },
  increasefontsize:function() {
    var fontsize=parseFloat($(".pagetext").css("font-size"));
    fontsize=fontsize*1.1;
    if (fontsize>40) return;
    $(".pagetext").css("font-size",fontsize+"px")
                  .css("line-height",(fontsize*1.7)+"px");
  },
  decreasefontsize:function() {
    var fontsize=parseFloat($(".pagetext").css("font-size"));
    fontsize=fontsize/1.1;
    if (fontsize<12) return;
    $(".pagetext").css("font-size",fontsize+"px")
    .css("line-height",(fontsize*1.7)+"px");
  },
  componentWillReceiveProps:function(nextProps) {
    this.setState({message:nextProps.message});
    var that=this;
    if(nextProps.message) {
      $(that.refs.message.getDOMNode()).show();
    } else {
      $(that.refs.message.getDOMNode()).hide();
    }
  },
  componentDidUpdate:function() {
    var that=this;
    if (this.state.message) {
      setTimeout(function(){
        that.setState({message:""});
        $(that.refs.message.getDOMNode()).hide();
      },3000);
    }
  },
  renderSideMenuButton:function() {
    if (this.props.sidemenu) {
      return <button className="btn btn-default" title="Hide Side Menu" onClick={this.props.toggleMenu}><img width="20" src="./banner/hidemenu.png"/></button>
    } else {
      return <button className="btn btn-default" title="Show Side Menu" onClick={this.props.toggleMenu}><img width="20" src="./banner/showmenu.png"/></button>
    }
  },
  render: function() {   
   return <div className="cursor controlbar">
            {this.renderSideMenuButton()}            
            <button className="btn btn-default" title="Previous File" onClick={this.props.prev}><img width="20" src="./banner/prev.png"/></button>
            <button className="btn btn-default" title="Next File" onClick={this.props.next}><img width="20" src="./banner/next.png"/></button>

            <button className="btn btn-default right" title="Contact Us"><a href="http://www.dharma-treasure.org/en/contact-us/" target="_new"><img width="20" src="./banner/icon-info.png"/></a></button>
            <button className="btn btn-default right" title="Toggle Wylie Transliteration" onClick={this.props.setwylie}><img width="20" src="./banner/icon-towylie.png"/></button>

            <button className="btn btn-default right" title="Increase Font Size" onClick={this.increasefontsize}><img width="20" src="./banner/increasefontsize.png"/></button>
            <button className="btn btn-default right" title="Decrease Font Size" onClick={this.decreasefontsize}><img width="20" src="./banner/decreasefontsize.png"/></button>
            <span ref="message" className="alert alert-success right">{this.state.message}</span>
            <br/>
            <br/><span id="address" dangerouslySetInnerHTML={{__html:this.getAddress()}}></span>
          </div>
  }  
});
module.exports=Textcontrolbar;