var React=require("react");
var Stacktoc=require("ksana2015-stacktoc").component;  //載入目錄顯示元件
var Searcharea=require("./searcharea.jsx");
var tibetan=require("ksana-tibetan").wylie;
var tabarea = React.createClass({
  getInitialState: function() {
    return {res:{},res_toc:[]};
  },
  setBannerHeight:function(bannerHeight) {
    var ch=document.documentElement.clientHeight;
    this.refs["tab-content"].getDOMNode().style.height=(ch-bannerHeight)+"px";//-40
  },
  componentDidUpdate:function()  {
    this.setBannerHeight(100);
  },  
  textConverter:function(t) {
    if(this.props.wylie == true) return tibetan.toWylie(t,null,false); 
    return t; 
  },
  render: function() {
    return (
      <div>     
        <div className="borderright">
          <ul className="nav nav-tabs" role="tablist">
            <li className="active"><a href="#Catalog" role="tab" data-toggle="tab" title="Catalog"><img width="25" src="./banner/icon-read.png"/></a></li>
            <li><a href="#Search" role="tab" onClick={this.startsearch} data-toggle="tab" title="Search"><img width="25" src="./banner/search.png"/></a></li>              
          </ul>

          <div className="tab-content" ref="tab-content">
            <div className="tab-pane fade in active" id="Catalog">               
              <Stacktoc className="stacktoc" textConverter={this.textConverter} showText={this.props.showText} showExcerpt={this.showExcerpt} 
              opts={{tocbar:"banner/bar.png",tocbar_start:"banner/bar_start.png",stopAt:"་",
              maxitemlength:42,tocstyle:"vertical_line"}}
              hits={this.state.res.rawresult} data={this.props.toc} goVoff={this.state.goVoff} />
            </div> 

            <div className="tab-pane fade" id="Search">
              <Searcharea db={this.props.db} />
            </div>        
          </div>      
        </div>           
      </div>
    );
  }
});
module.exports=tabarea;