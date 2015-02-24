var React=require("react");
var Defbox = React.createClass({
  getInitialState: function() {
    return {openBox:false,id:0,ch:""};
  }, 
  openDialog:function() {
   // if(this.props.openBox) this.refs.dictdialog.getDOMNode().classList.add("opened");
  },
  closeDialog:function() {
    //this.refs.dictdialog.getDOMNode().classList.remove("opened");
    this.setState({openBox:false});
    this.props.popStack(this.props.terms.length,true);
  },
  componentWillReceiveProps: function(nextprops) {
    this.setState({openBox:nextprops.openBox});
  },
  todosearch: function(e) {
    //this.props.ids.push(e.target.id);
    var ch=e.target.textContent;
    this.props.dosearch(e);
  },
  renderTerm: function(item,termIndex) {
      return (
      <div data-term={item[0]} onClick={this.todosearch}>
        <div>{item}</div>
      </div>
      )
  },
  render: function() {
    var d=this.props.def || [["no result"]];
    var def=d.map(this.renderTerm);
   // this.openDialog();
    var opened=this.state.openBox?" opened":"";
    //var boxPos="left:"+this.props.clickedChPos.left+"; top:"+this.props.clickedChPos.top+";";
    var boxPos={
      left:this.props.clickedChPos.left,
      top:this.props.clickedChPos.top
    };
    return (

      <div>
        <div className={"modalDialog"+opened} ref="dictdialog" style={boxPos}>
        <a href="#" onClick={this.closeDialog} 
          title="Close" className="modalClose"> X </a>      
        {def}
        </div>
      </div>
      );
  }
});
module.exports=Defbox;