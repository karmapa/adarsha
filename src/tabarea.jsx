var React=require("react");
var tabarea = React.createClass({
  getInitialState: function() {
    return {};
  },
  textConverter:function(t) {
    if(this.state.wylie == true) return tibetan.romanize.toWylie(t,null,false); 
    return t; 
  },
  showExcerpt:function(n) {
    var voff=this.state.toc[n].voff;
    var end=this.state.toc[n].end;
    var hit=this.state.toc[n].hit;
   // var searchtabid=$(".tab-pane#Search").attr("id");
    $('.nav a[href=#Search]').tab('show');
    $("label.searchmode").removeClass("active");
    $("label[data-type='fulltext']").addClass("active");
    this.dosearch(null,null,[voff,end,hit]);
  },
  dosearch: function(e,reactid,start_end){
    var start=start_end,tochit=0;
    var end=this.state.db.get("meta").vsize;
    if (typeof start_end!="number" && typeof start_end[0]=="number") {
      start=start_end[0];
      end=start_end[1];
      tochit=start_end[2];
    }
    var field=$(this.refs.searchtype.getDOMNode()).find(".active")[0].dataset.type;
    var tofind=this.refs.tofind.getDOMNode().value.trim();
    tofind=tofind.replace(/\\/g,"\\\\"); //escape operator
    tofind=tofind.replace(/\*/g,"**"); //escape operator

    tofind=tibetan.romanize.fromWylie(tofind);
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
      var res_kacha=search_api.searchKacha(tofind,this.state.toc);
      if(tofind != "") this.setState({res_toc:res_kacha||[], tofind:tofind, res:[]});
      else this.setState({res_toc:[], tofind:tofind, res:[]});
    }
    if(field == "sutra"){
      var res_sutra=search_api.searchSutra(tofind,this.state.toc);
      if(tofind != "") this.setState({res_toc:res_sutra||[], tofind:tofind, res:[]});
      else this.setState({res_toc:[], tofind:tofind, res:[]});
    }  
  },
  render: function() {
    return (
      <div>
        <div className={menuclass}>
          <div className="borderright">
            <ul className="nav nav-tabs" role="tablist">
              <li className="active"><a href="#Catalog" role="tab" data-toggle="tab" title="Catalog"><img width="25" src="./banner/icon-read.png"/></a></li>
              <li><a href="#Search" role="tab" onClick={this.startsearch} data-toggle="tab" title="Search"><img width="25" src="./banner/search.png"/></a></li>              
            </ul>

            <div className="tab-content" ref="tab-content">
              <div className="tab-pane fade in active" id="Catalog">               
                <Stacktoc textConverter={this.textConverter} showText={this.showText} showExcerpt={this.showExcerpt} 
                opts={{tocbar:"banner/bar.png",tocbar_start:"banner/bar_start.png",stopAt:"་",
                maxitemlength:42,tocstyle:"vertical_line"}}
                hits={this.state.res.rawresult} data={this.state.toc} goVoff={this.state.goVoff} />
              </div>

              <div className="tab-pane fade" id="Search">
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
            </div>      
          </div>     
        </div>
      </div>
    );
  }
});
module.exports=tabarea;