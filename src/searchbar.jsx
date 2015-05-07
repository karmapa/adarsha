/** @jsx React.DOM */

/* to rename the component, change name of ./component.js and  "dependencies" section of ../../component.js */

//var othercomponent=Require("other"); 
var React=require("react");
var searchbar = react.createClass({
  getInitialState: function() {
    return {find:[],field:[]};
  },
  dosearch:function() {
    var find=this.refs.tofind.getDOMNode().value;
    var field=e.target.dataset.type;
    this.props.dosearch(null,null,0,field,tofind);
  },
  render: function() {
    return (
      <div>
        <input className="form-control" onInput={this.dosearch} ref="tofind" defaultValue="byang chub"></input>
        <div className="btn-group" data-toggle="buttons" ref="searchtype" onClick={this.dosearch}>
          <label data-type="sutra" className="btn btn-success">
          <input type="radio" name="field" autocomplete="off">Sutra</input>
          </label>
          <label data-type="kacha" className="btn btn-success">
          <input type="radio" name="field" autocomplete="off">Kacha</input>
          </label>
          <label data-type="fulltext" className="btn btn-success" >
          <input type="radio" name="field" autocomplete="off">Text</input>
          </label>
        </div>
      </div>
    );
  }
});
module.exports=searchbar;