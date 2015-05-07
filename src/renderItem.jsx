/** @jsx React.DOM */

/* to rename the component, change name of ./component.js and  "dependencies" section of ../../component.js */

//var othercomponent=Require("other"); 
var React=require("react");
var renderItem = react.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  onItemClick:function(e) {
    var voff=parseInt(e.target.dataset.voff);
    <span>{e.target.innerHTML}</span>
    this.props.gotopage(voff);
  },
  renderItem: function(item) {
    var tofind=this.props.tofind_toc;
    var c=""
    c=item.text.replace(tofind,function(t){
      return '<hl>'+t+"</hl>";
    });
    return (
      <div>
        <li><a herf='#' className="item" data-voff={item.voff} onClick={this.onItemClick} dangerouslySetInnerHTML={{__html:c}}></a></li>
      </div> 
      )
  },
  render: function() {
    return (
      <div>
        {this.props.data.map(this.renderItem)}
      </div>
    );
  }
});

module.exports=renderItem;