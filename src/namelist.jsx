/** @jsx React.DOM */

/* to rename the component, change name of ./component.js and  "dependencies" section of ../../component.js */

//var othercomponent=Require("other"); 
var React=require("react");
var tibetan=require("ksana-tibetan").wylie;
var namelist = React.createClass({
  getInitialState: function() {
    return {selected:null};
  },
  componentDidUpdate:function() {
    if(this.selectedentry) {
      //this.selectedentry.removeClass("entry-selected");
      this.selectedentry.addClass("entry-selected");
    } 
  },
  componentWillReceiveProps :function(nextProps) {
    if (nextProps.res_toc.length!=this.props.res_toc.length) {
      if (this.selectedentry)  this.selectedentry.removeClass("entry-selected");
      this.selectedentry=null;
    }
  },
  onItemClick:function(e) {
    var voff=parseInt(e.target.dataset.voff);
    var parent=e.target.parentElement;
    if (e.target.nodeName == "HL") {
      voff=parseInt(e.target.parentElement.dataset.voff);
      parent=e.target.parentElement.parentElement;
    }
    if (this.selectedentry)  this.selectedentry.removeClass("entry-selected");
    //  $(e.target).addClass("entry-selected");
    this.selectedentry=$(e.target);

    //<span>{e.target.innerHTML}</span>
    this.props.gotofile(voff);
  },
  renderNameItem: function(item,idx) {
    var context="";
    if(this.props.wylie == false){
      var tofind=this.props.tofind;
      context=item.text.replace(tofind,function(t){return '<span class="hl">'+t+"</span>";});
    }
    if(this.props.wylie == true){
      var tofind=tibetan.romanize.toWylie(this.props.tofind,null,false);
      context=tibetan.romanize.toWylie(item.text,null,false).replace(tofind,function(t){return '<hl>'+t+"</hl>";});
    }
      
    return (
      <div>
        {idx+1}.<a herf='#' className="item" data-voff={item.voff} onClick={this.onItemClick} dangerouslySetInnerHTML={{__html:context}}></a>
      </div> 
      )
  },
  renderCount:function() {
    if (!this.props.res_toc || !this.props.res_toc.length) {
      return null;
    } else {
      return <span>{this.props.res_toc.length}<br/></span>      
    }
  },
  render: function() {
    
    return (
      <div className="namelist">
        {this.renderCount()}
        {this.props.res_toc.map(this.renderNameItem)}
      </div>
    );
  }
});
module.exports=namelist;