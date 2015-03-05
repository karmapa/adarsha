/** @jsx React.DOM */

//var othercomponent=Require("other"); 
var React=require("react");
var Namelist=require("./namelist.jsx");
var Resultlist=require("./resultlist.jsx");
var tibetan=require("ksana-tibetan").wylie;
var kse=require("ksana-search"); // Ksana Search Engine (run at client side)
var search_api=require("./search_api");

var searcharea= React.createClass({
  getInitialState: function() {
    return {res:{},res_toc:[]};
  },
  showExcerpt:function(n) {
    var voff=this.props.toc[n].voff;
    var end=this.props.toc[n].end;
    var hit=this.props.toc[n].hit;
   // var searchtabid=$(".tab-pane#Search").attr("id");
    $('.nav a[href=#Search]').tab('show');
    $("label.searchmode").removeClass("active");
    $("label[data-type='fulltext']").addClass("active");
    this.dosearch(null,null,[voff,end,hit]);
  },
  renderInputSyntax:function() {
    if (!this.refs.searchtype) return;
    var field=$(this.refs.searchtype.getDOMNode()).find(".active")[0].dataset.type;
    if (this.refs && this.refs.tofind && this.refs.tofind.getDOMNode().value.length==0){
      if (field=="fulltext") {
        return (
        <div className="syntaxhelper">
          <div><b>Wildcards:</b> ? * <br/>
            ? match single unknown syllable:<br/>
              e.g: <a href="#" onClick={this.clicksearch}>bde ? snying</a> 1 syllable in between<br/>
              e.g: <a href="#" onClick={this.clicksearch}>མི་2?་པ</a> 2 syllables in between<br/>
            * match a range of unknown syllables:<br/>
              e.g: <a href="#" onClick={this.clicksearch}>mi 5* pa</a> 1 to 5 syllables in between<br/>

          </div>
          <div><b>Word separator:</b>
           / or ། (shad) <br/>
              e.g: <a href="#" onClick={this.clicksearch}>bde/snying</a><br/>
          </div>      
        </div>
          ) 
      } else if (field=="sutra") {
        return (
          <div className="syntaxhelper">
            Type <a href="#" onClick={this.clicksearch} style={{fontSize:"300%"}}>་</a>(tsheg) to display all titles.
          </div>
        )
      } else {
        return (
          <div className="syntaxhelper">
            Type <a href="#" onClick={this.clicksearch} style={{fontSize:"300%"}}>་</a>(tsheg) to display table of content.
          </div>
        )
      }

    } else return null;
    
  },
  tofindchange:function(e) {
    clearTimeout(this.tofindtimer);
    var that=this;
    this.tofindtimer=setTimeout(function(){
      that.dosearch(null,null,0);
    },300);
    //var field=e.target.parentElement.dataset.type;
  },
  renderinputs:function(searcharea) {  // input interface for search // onInput={this.searchtypechange}
    if (this.props.db) {
      return (    
        <div className="button-group ">
            <input ref="tofind" className="tofind searchinput input-lg form-control" type="search" id="tofind" onInput={this.tofindchange} 
            placeholder="Type Tibetan or Wylie transliteration"/>
        </div>
        )          
    } else {
      return <span>loading database....</span>
    }
  },   
  startsearch:function() {
    var that=this;
    setTimeout(function(){
      that.refs.tofind.getDOMNode().focus();  
    },500);
  },
  removeLeadingEndingSpace:function(tofind) {
    if (!tofind || tofind.length<2) return tofind;
    return tofind.replace(/^་/,"").replace(/་$/,"");
  },
  dosearch: function(e,reactid,start_end){
    var start=start_end,tochit=0;
    var end=this.props.db.get("meta").vsize;
    if (typeof start_end!="number" && typeof start_end[0]=="number") {
      start=start_end[0];
      end=start_end[1];
      tochit=start_end[2];
    }
    var field=$(this.refs.searchtype.getDOMNode()).find(".active")[0].dataset.type;
    var tofind=this.refs.tofind.getDOMNode().value.trim();
    tofind=tofind.replace(/\\/g,"\\\\"); //escape operator
    tofind=tofind.replace(/\*/g,"**"); //escape operator

    tofind=tibetan.fromWylie(tofind);//tibetan.romanize.fromWylie(tofind)
    tofind=tofind.replace(/༌༌/g,"*");
    tofind=this.removeLeadingEndingSpace(tofind);

    field=field || this.state.field;
    if(field == "fulltext"){
      kse.search(this.state.db,tofind,{phrase_sep:"།",
        range:{start:start,end:end,maxhit:100}},function(data){ //call search engine          
        data.tochit=tochit;
        this.setState({res:data, tofind:tofind, res_toc:[] });  
      });
    }
    if(field == "kacha"){
      var res_kacha=search_api.searchKacha(tofind,this.props.toc);
      if(tofind != "") this.setState({res_toc:res_kacha||[], tofind:tofind, res:[]});
      else this.setState({res_toc:[], tofind:tofind, res:[]});
    }
    if(field == "sutra"){
      var res_sutra=search_api.searchSutra(tofind,this.props.toc);
      if(tofind != "") this.setState({res_toc:res_sutra||[], tofind:tofind, res:[]});
      else this.setState({res_toc:[], tofind:tofind, res:[]});
    }  
  },
  render: function() {
    return (
     <div>
        <div className="slight"><br/></div>
        {this.renderinputs("title")}
        <div className="center">
          <div className="btn-group" data-toggle="buttons" ref="searchtype" onClick={this.searchtypechange}>
            <label data-type="sutra" className="btn btn-default btn-xs searchmode">
            <input type="radio" name="field" autocomplete="off"><img title="མདོ་མིང་འཚོལ་བ། Title Search" width="25" src="./banner/icon-sutra.png"/></input>
            </label>
            <label data-type="kacha" className="btn btn-default btn-xs searchmode">
            <input type="radio" name="field" autocomplete="off"><img title="དཀར་ཆག་འཚོལ་བ། Table of Content Search" width="25" src="./banner/icon-kacha.png"/></input>
            </label>
            <label data-type="fulltext" className="btn btn-default btn-xs searchmode active">
            <input type="radio" name="field" autocomplete="off"><img title="ནང་དོན་འཚོལ་བ།  Full Text Search" width="25" src="./banner/icon-fulltext.png"/></input>
            </label>
          </div> 
        </div>       
        {this.renderInputSyntax()}
        <Namelist wylie={this.state.wylie} res_toc={this.state.res_toc} tofind={this.state.tofind} gotofile={this.gotofile} />
        <Resultlist wylie={this.state.wylie} res={this.state.res} tofind={this.state.tofind} gotofile={this.gotofile} />
      </div>
    );
  }
});
module.exports=searcharea;