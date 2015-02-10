/** @jsx React.DOM */

/* to rename the component, change name of ./component.js and  "dependencies" section of ../../component.js */

//var othercomponent=Require("other"); 
var React=require("react");
var tibetan=require("ksana-tibetan").wylie;
var resultlist=React.createClass({  //should search result
  show:function() {
    if(this.props.wylie == false) var tofind=this.props.tofind;
    if(this.props.wylie == true ) var tofind=tibetan.romanize.toWylie(this.props.tofind,null,false);
    
    try {
      var t = new RegExp(tofind,"g"); 
      return this.props.res.excerpt.map(function(r,i){ // excerpt is an array 
      
        var context="";
        if(this.props.wylie == false) context=r.text;//r.text.replace(t,function(tofind){return "<hl>"+tofind+"</hl>"});
        if(this.props.wylie == true) context=tibetan.romanize.toWylie(r.text,null,false).replace(t,function(tofind){return "<hl>"+tofind+"</hl>"});
        return <div data-vpos={r.hits[0][0]}>
        <a onClick={this.gotopage} className="pagename">{r.pagename}</a>
          <div className="resultitem" dangerouslySetInnerHTML={{__html:context}}></div>
        </div>
      },this);
    } catch(e) {
    return null;
  }
  }, 
  gotopage:function(e) {
    var vpos=parseInt(e.target.parentNode.dataset['vpos']);
    this.props.gotofile(vpos);
  },
  renderCount:function() {
    var hit=this.props.res.tochit ||this.props.res.rawresult.length;

    return <span>{hit} hits</span>;
  },
  warnTooMuch:function() {
    if (this.props.res.excerptOverflow)  {
      return <div className="alert alert-danger" role="danger">
        Please refine your search or click number beside table of content to narrow down the range.
      </div>
    }
  },
  render:function() {
    if (this.props.res) {
      if (this.props.res.excerpt&&this.props.res.excerpt.length) {
          return <div className="results">
                  {this.renderCount()}<br/>{this.show()}
                  <br/>{this.warnTooMuch()}
                  </div>
      } else {
        return <div></div>
      }
    }
    else {
      return <div>type keyword to search</div>
    } 
  }
});
module.exports=resultlist; 